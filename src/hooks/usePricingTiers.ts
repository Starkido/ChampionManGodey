import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface PricingTier {
  id: string;
  network: string;
  package_name: string;
  data_amount: string;
  price: number;
  role: AppRole;
  is_active: boolean;
}

interface UsePricingTiersResult {
  tiers: PricingTier[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePricingTiers = (
  userRole: AppRole,
  network?: string
): UsePricingTiersResult => {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("pricing_tiers")
        .select("*")
        .eq("role", userRole)
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (network) {
        query = query.eq("network", network);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setTiers(data || []);
    } catch (err) {
      console.error("Error fetching pricing tiers:", err);
      setError("Failed to load pricing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, [userRole, network]);

  return {
    tiers,
    loading,
    error,
    refetch: fetchTiers,
  };
};
