-- Create function to process referral on signup
CREATE OR REPLACE FUNCTION public.process_referral_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
$function$;

-- Create trigger to process referral on profile creation
DROP TRIGGER IF EXISTS on_profile_created_process_referral ON public.profiles;
CREATE TRIGGER on_profile_created_process_referral
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.process_referral_signup();

-- Create function to credit referrer commission on purchase
CREATE OR REPLACE FUNCTION public.credit_referrer_commission(
  _user_id UUID,
  _purchase_amount NUMERIC,
  _commission_rate NUMERIC DEFAULT 0.02
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
$function$;