import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Referral {
  id: string;
  referred_id: string;
  commission: number;
  status: string;
  created_at: string;
}

interface UseReferralsResult {
  referrals: Referral[];
  totalEarnings: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useReferrals = (userId: string | undefined): UseReferralsResult => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const referralData = data || [];
      setReferrals(referralData);

      // Calculate total earnings from completed referrals
      const earnings = referralData
        .filter((r) => r.status === "completed")
        .reduce((sum, r) => sum + Number(r.commission), 0);
      setTotalEarnings(earnings);
    } catch (err) {
      console.error("Error fetching referrals:", err);
      setError("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [userId]);

  return {
    referrals,
    totalEarnings,
    loading,
    error,
    refetch: fetchReferrals,
  };
};
