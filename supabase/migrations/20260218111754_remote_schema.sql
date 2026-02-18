set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.credit_wallet(_user_id uuid, _amount numeric)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE wallets
    SET balance = balance + _amount,
        updated_at = NOW()
    WHERE user_id = _user_id;

    -- Optionally, you can raise a notice for logging
    -- RAISE NOTICE 'Wallet credited: user_id=% amount=%', _user_id, _amount;
END;
$function$
;


