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
  created_at: string;
  updated_at: string;
}

interface UseAdminPricingResult {
  tiers: PricingTier[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTier: (tier: Omit<PricingTier, "id" | "created_at" | "updated_at">) => Promise<boolean>;
  updateTier: (id: string, updates: Partial<PricingTier>) => Promise<boolean>;
  deleteTier: (id: string) => Promise<boolean>;
}

export const useAdminPricing = (): UseAdminPricingResult => {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("pricing_tiers")
        .select("*")
        .order("network")
        .order("role")
        .order("price", { ascending: true });

      if (fetchError) throw fetchError;

      setTiers(data || []);
    } catch (err) {
      console.error("Error fetching pricing tiers:", err);
      setError("Failed to load pricing tiers");
    } finally {
      setLoading(false);
    }
  };

  const createTier = async (
    tier: Omit<PricingTier, "id" | "created_at" | "updated_at">
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("pricing_tiers")
        .insert(tier)
        .select()
        .single();

      if (error) throw error;

      setTiers((prev) => [...prev, data]);
      return true;
    } catch (err) {
      console.error("Error creating tier:", err);
      return false;
    }
  };

  const updateTier = async (
    id: string,
    updates: Partial<PricingTier>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("pricing_tiers")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setTiers((prev) =>
        prev.map((tier) => (tier.id === id ? { ...tier, ...updates } : tier))
      );
      return true;
    } catch (err) {
      console.error("Error updating tier:", err);
      return false;
    }
  };

  const deleteTier = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("pricing_tiers").delete().eq("id", id);

      if (error) throw error;

      setTiers((prev) => prev.filter((tier) => tier.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting tier:", err);
      return false;
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  return {
    tiers,
    loading,
    error,
    refetch: fetchTiers,
    createTier,
    updateTier,
    deleteTier,
  };
};
