drop extension if exists "pg_net";

alter table "public"."transactions" drop constraint "transactions_type_check";


  create table "public"."admin_logs" (
    "id" uuid not null default gen_random_uuid(),
    "admin_id" uuid not null,
    "action" text not null,
    "target_user" uuid,
    "metadata" jsonb,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."profiles" add column "is_blocked" boolean not null default false;

CREATE UNIQUE INDEX admin_logs_pkey ON public.admin_logs USING btree (id);

CREATE UNIQUE INDEX transactions_reference_unique ON public.transactions USING btree (reference);

alter table "public"."admin_logs" add constraint "admin_logs_pkey" PRIMARY KEY using index "admin_logs_pkey";

alter table "public"."transactions" add constraint "transactions_type_check" CHECK ((type = ANY (ARRAY['wallet_funding'::text, 'manual_funding'::text, 'admin_credit'::text, 'purchase'::text, 'commission'::text, 'withdrawal'::text, 'refund'::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_type_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.admin_clear_cart(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  cart_uuid UUID;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT id
  INTO cart_uuid
  FROM public.carts
  WHERE user_id = p_user_id;

  IF cart_uuid IS NULL THEN
    RETURN;
  END IF;

  DELETE FROM public.cart_items
  WHERE cart_id = cart_uuid;

  INSERT INTO public.admin_logs (admin_id, action, target_user)
  VALUES (
    auth.uid(),
    'clear_cart',
    p_user_id
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_debit_wallet(p_user_id uuid, p_amount numeric, p_reason text)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    current_balance NUMERIC;
BEGIN
    -- Check admin
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Validate amount
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
    END IF;

    -- Lock wallet row
    SELECT balance
    INTO current_balance
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF current_balance IS NULL THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    IF current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Update wallet
    UPDATE public.wallets
    SET balance = balance - p_amount
    WHERE user_id = p_user_id;

    -- Insert transaction with a valid type
    INSERT INTO public.transactions (
        user_id,
        type,
        amount,
        status,
        metadata
    )
    VALUES (
        p_user_id,   -- function parameter
        'purchase',  -- valid type from your constraint
        -p_amount,
        'success',
        jsonb_build_object(
            'reason', p_reason,
            'admin_action', TRUE
        )
    );

    -- Log admin action
    INSERT INTO public.admin_logs (admin_id, action, target_user, metadata)
    VALUES (
        auth.uid(),
        'debit_wallet',
        p_user_id,
        jsonb_build_object(
            'amount', p_amount,
            'reason', p_reason
        )
    );

    RETURN current_balance - p_amount;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_user_blocked(p_user_id uuid, p_blocked boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.profiles
  SET is_blocked = p_blocked
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  INSERT INTO public.admin_logs (admin_id, action, target_user, metadata)
  VALUES (
    auth.uid(),
    'set_user_blocked',
    p_user_id,
    jsonb_build_object('blocked', p_blocked)
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_update_profile(p_user_id uuid, p_first_name text, p_last_name text, p_phone text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.profiles
  SET
    first_name = p_first_name,
    last_name  = p_last_name,
    phone      = p_phone
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  INSERT INTO public.admin_logs (admin_id, action, target_user)
  VALUES (
    auth.uid(),
    'update_profile',
    p_user_id
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.debit_wallet(_user_id uuid, _amount numeric)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  new_balance numeric;
begin
  update wallets
  set balance = balance - _amount,
      updated_at = now()
  where user_id = _user_id
    and balance >= _amount
  returning balance into new_balance;

  if not found then
    raise exception 'INSUFFICIENT_FUNDS';
  end if;

  return new_balance;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.credit_referrer_commission(_user_id uuid, _purchase_amount numeric, _commission_rate numeric DEFAULT 0.02)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  referrer_id_val UUID;
  commission_amount NUMERIC;
  referral_record_id UUID;
BEGIN
  -- Find the referrer for this user
  SELECT r.referrer_id, r.id INTO referrer_id_val, referral_record_id
  FROM public.referrals r
  WHERE r.referred_id = _user_id
  LIMIT 1;
  
  IF referrer_id_val IS NOT NULL THEN
    -- Calculate commission (2% by default)
    commission_amount := _purchase_amount * _commission_rate;
    
    -- Credit commission to referrer's wallet
    UPDATE public.wallets
    SET balance = balance + commission_amount,
        updated_at = now()
    WHERE user_id = referrer_id_val;
    
    -- Update referral record
    UPDATE public.referrals
    SET status = 'completed',
        commission = commission + commission_amount
    WHERE id = referral_record_id;
    
    -- Create commission transaction record
    INSERT INTO public.transactions (user_id, type, amount, status, reference, metadata)
    VALUES (
      referrer_id_val,
      'commission',
      commission_amount,
      'success',
      'COM-' || to_char(now(), 'YYYYMMDD') || '-' || substring(gen_random_uuid()::text from 1 for 8),
      jsonb_build_object(
        'referred_user_id', _user_id,
        'purchase_amount', _purchase_amount,
        'commission_rate', _commission_rate
      )
    );
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
 RETURNS public.app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  ref_code TEXT;
  ref_profile_id UUID;
  input_referral_code TEXT;
BEGIN
  -- Generate unique referral code for new user
  LOOP
    ref_code := public.generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = ref_code);
  END LOOP;

  -- Get the referral code from user metadata
  input_referral_code := NEW.raw_user_meta_data->>'referral_code';
  
  -- Look up the referrer's profile ID if a referral code was provided
  IF input_referral_code IS NOT NULL AND input_referral_code != '' THEN
    SELECT id INTO ref_profile_id
    FROM public.profiles
    WHERE referral_code = input_referral_code;
  END IF;

  -- Create user role (default: client)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');

  -- Create profile with referrer info
  INSERT INTO public.profiles (user_id, email, first_name, last_name, phone, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    ref_code,
    ref_profile_id
  );

  -- Create wallet
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);

  -- Create cart
  INSERT INTO public.carts (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$function$
;

CREATE OR REPLACE FUNCTION public.process_referral_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  referrer_profile_id UUID;
  referrer_user_id UUID;
BEGIN
  -- Check if the user was referred (has referred_by set)
  IF NEW.referred_by IS NOT NULL THEN
    -- Get the referrer's profile
    SELECT id, user_id INTO referrer_profile_id, referrer_user_id
    FROM public.profiles
    WHERE id = NEW.referred_by;
    
    -- Create a pending referral record
    IF referrer_user_id IS NOT NULL THEN
      INSERT INTO public.referrals (referrer_id, referred_id, status, commission)
      VALUES (referrer_user_id, NEW.user_id, 'pending', 0);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."admin_logs" to "anon";

grant insert on table "public"."admin_logs" to "anon";

grant references on table "public"."admin_logs" to "anon";

grant select on table "public"."admin_logs" to "anon";

grant trigger on table "public"."admin_logs" to "anon";

grant truncate on table "public"."admin_logs" to "anon";

grant update on table "public"."admin_logs" to "anon";

grant delete on table "public"."admin_logs" to "authenticated";

grant insert on table "public"."admin_logs" to "authenticated";

grant references on table "public"."admin_logs" to "authenticated";

grant select on table "public"."admin_logs" to "authenticated";

grant trigger on table "public"."admin_logs" to "authenticated";

grant truncate on table "public"."admin_logs" to "authenticated";

grant update on table "public"."admin_logs" to "authenticated";

grant delete on table "public"."admin_logs" to "service_role";

grant insert on table "public"."admin_logs" to "service_role";

grant references on table "public"."admin_logs" to "service_role";

grant select on table "public"."admin_logs" to "service_role";

grant trigger on table "public"."admin_logs" to "service_role";

grant truncate on table "public"."admin_logs" to "service_role";

grant update on table "public"."admin_logs" to "service_role";


