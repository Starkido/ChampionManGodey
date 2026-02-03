-- Update handle_new_user to process referral codes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
$function$;