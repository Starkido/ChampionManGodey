alter table "public"."pricing_tiers" drop constraint "pricing_tiers_network_check";

alter table "public"."pricing_tiers" add constraint "pricing_tiers_network_check" CHECK ((network = ANY (ARRAY['MTN'::text, 'AT_iShare'::text, 'AT_BigTime'::text, 'Telecel'::text, 'MTN_AFA'::text]))) not valid;

alter table "public"."pricing_tiers" validate constraint "pricing_tiers_network_check";


