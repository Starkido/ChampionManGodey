drop trigger if exists "update_carts_updated_at" on "public"."carts";

drop trigger if exists "update_manual_funding_requests_updated_at" on "public"."manual_funding_requests";

drop trigger if exists "update_pricing_tiers_updated_at" on "public"."pricing_tiers";

drop trigger if exists "on_profile_created_process_referral" on "public"."profiles";

drop trigger if exists "update_profiles_updated_at" on "public"."profiles";

drop trigger if exists "update_user_roles_updated_at" on "public"."user_roles";

drop trigger if exists "update_wallets_updated_at" on "public"."wallets";

drop trigger if exists "update_withdrawals_updated_at" on "public"."withdrawals";

drop policy "Admins can manage cart items" on "public"."cart_items";

drop policy "Users can delete own cart items" on "public"."cart_items";

drop policy "Users can insert own cart items" on "public"."cart_items";

drop policy "Users can update own cart items" on "public"."cart_items";

drop policy "Users can view own cart items" on "public"."cart_items";

drop policy "Admins can manage carts" on "public"."carts";

drop policy "Admins can manage funding requests" on "public"."manual_funding_requests";

drop policy "Admins can manage pricing tiers" on "public"."pricing_tiers";

drop policy "Admins can manage profiles" on "public"."profiles";

drop policy "Admins can view all profiles" on "public"."profiles";

drop policy "Admins can manage referrals" on "public"."referrals";

drop policy "Admins can view all referrals" on "public"."referrals";

drop policy "Admins can manage transactions" on "public"."transactions";

drop policy "Admins can view all transactions" on "public"."transactions";

drop policy "Admins can manage roles" on "public"."user_roles";

drop policy "Admins can view all roles" on "public"."user_roles";

drop policy "Admins can manage wallets" on "public"."wallets";

drop policy "Admins can view all wallets" on "public"."wallets";

drop policy "Admins can manage withdrawals" on "public"."withdrawals";

alter table "public"."cart_items" drop constraint "cart_items_cart_id_fkey";

alter table "public"."cart_items" drop constraint "cart_items_pricing_tier_id_fkey";

alter table "public"."profiles" drop constraint "profiles_referred_by_fkey";

drop function if exists "public"."has_role"(_user_id uuid, _role app_role);

alter table "public"."pricing_tiers" alter column "role" set data type public.app_role using "role"::text::public.app_role;

alter table "public"."user_roles" alter column "role" set default 'client'::public.app_role;

alter table "public"."user_roles" alter column "role" set data type public.app_role using "role"::text::public.app_role;

alter table "public"."cart_items" add constraint "cart_items_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE not valid;

alter table "public"."cart_items" validate constraint "cart_items_cart_id_fkey";

alter table "public"."cart_items" add constraint "cart_items_pricing_tier_id_fkey" FOREIGN KEY (pricing_tier_id) REFERENCES public.pricing_tiers(id) ON DELETE CASCADE not valid;

alter table "public"."cart_items" validate constraint "cart_items_pricing_tier_id_fkey";

alter table "public"."profiles" add constraint "profiles_referred_by_fkey" FOREIGN KEY (referred_by) REFERENCES public.profiles(id) not valid;

alter table "public"."profiles" validate constraint "profiles_referred_by_fkey";

set check_function_bodies = off;

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


  create policy "Admins can manage cart items"
  on "public"."cart_items"
  as permissive
  for all
  to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "Users can delete own cart items"
  on "public"."cart_items"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.carts
  WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = auth.uid())))));



  create policy "Users can insert own cart items"
  on "public"."cart_items"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.carts
  WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = auth.uid())))));



  create policy "Users can update own cart items"
  on "public"."cart_items"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.carts
  WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM public.carts
  WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = auth.uid())))));



  create policy "Users can view own cart items"
  on "public"."cart_items"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.carts
  WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = auth.uid())))));



  create policy "Admins can manage carts"
  on "public"."carts"
  as permissive
  for all
  to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "Admins can manage funding requests"
  on "public"."manual_funding_requests"
  as permissive
  for all
  to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "Admins can manage pricing tiers"
  on "public"."pricing_tiers"
  as permissive
  for all
  to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "Admins can manage profiles"
  on "public"."profiles"
  as permissive
  for all
  to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "Admins can view all profiles"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (public.is_admin(auth.uid()));



  create policy "Admins can manage referrals"
  on "public"."referrals"
  as permissive
  for all
  to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "Admins can view all referrals"
  on "public"."referrals"
  as permissive
  for select
  to authenticated
using (public.is_admin(auth.uid()));



  create policy "Admins can manage transactions"
  on "public"."transactions"
  as permissive
  for all
  to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "Admins can view all transactions"
  on "public"."transactions"
  as permissive
  for select
  to authenticated
using (public.is_admin(auth.uid()));



  create policy "Admins can manage roles"
  on "public"."user_roles"
  as permissive
  for all
  to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "Admins can view all roles"
  on "public"."user_roles"
  as permissive
  for select
  to authenticated
using (public.is_admin(auth.uid()));



  create policy "Admins can manage wallets"
  on "public"."wallets"
  as permissive
  for all
  to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "Admins can view all wallets"
  on "public"."wallets"
  as permissive
  for select
  to authenticated
using (public.is_admin(auth.uid()));



  create policy "Admins can manage withdrawals"
  on "public"."withdrawals"
  as permissive
  for all
  to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));


CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manual_funding_requests_updated_at BEFORE UPDATE ON public.manual_funding_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_tiers_updated_at BEFORE UPDATE ON public.pricing_tiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_profile_created_process_referral AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.process_referral_signup();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

drop trigger if exists "on_auth_user_created" on "auth"."users";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


