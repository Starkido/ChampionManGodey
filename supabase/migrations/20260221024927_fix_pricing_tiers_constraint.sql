ALTER TABLE "public"."pricing_tiers" DROP CONSTRAINT IF EXISTS "pricing_tiers_network_check";

ALTER TABLE "public"."pricing_tiers"
ADD CONSTRAINT "pricing_tiers_network_check"
CHECK (network = ANY (ARRAY['MTN','AT_iShare','AT_BigTime','Telecel','MTN_AFA'])) NOT VALID;