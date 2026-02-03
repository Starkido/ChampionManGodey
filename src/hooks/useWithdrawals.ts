import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  phone_number: string;
  network: string;
  status: string;
  admin_note: string | null;
  processed_at: string | null;
  reference: string | null;
  created_at: string;
  updated_at: string;
}

export const useWithdrawals = (userId: string | undefined) => {
  const { data: withdrawals, isLoading, refetch } = useQuery({
    queryKey: ["withdrawals", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Withdrawal[];
    },
    enabled: !!userId,
  });

  return {
    withdrawals: withdrawals || [],
    isLoading,
    refetch,
  };
};

export const useAdminWithdrawals = () => {
  const { data: withdrawals, isLoading, refetch } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Withdrawal[];
    },
  });

  return {
    withdrawals: withdrawals || [],
    isLoading,
    refetch,
  };
};
