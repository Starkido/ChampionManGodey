import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ManualFundingRequest {
  id: string;
  amount: number;
  network: string;
  transaction_id: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  processed_at: string | null;
}

export const useManualFunding = (userId: string | undefined) => {
  const [requests, setRequests] = useState<ManualFundingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("manual_funding_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching manual funding requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  return { requests, loading, refetch: fetchRequests };
};
