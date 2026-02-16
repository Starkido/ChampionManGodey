import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subDays, startOfDay, format } from "date-fns";

interface AdminTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  reference: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface DailyStats {
  date: string;
  funding: number;
  purchases: number;
  commissions: number;
}

interface UseAdminTransactionsResult {
  transactions: AdminTransaction[];
  loading: boolean;
  error: string | null;
  stats: {
    totalFunding: number;
    totalPurchases: number;
    totalCommissions: number;
    pendingCount: number;
  };
  dailyStats: DailyStats[];
  refetch: () => Promise<void>;
}

export const useAdminTransactions = (limit?: number): UseAdminTransactionsResult => {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalFunding: 0,
    totalPurchases: 0,
    totalCommissions: 0,
    pendingCount: 0,
  });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch transactions
      let query = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data: txData, error: txError } = await query;

      if (txError) throw txError;

      // Fetch profiles for user names
      const userIds = [...new Set((txData || []).map((t) => t.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email, first_name, last_name")
        .in("user_id", userIds);

      // Combine data
      const enrichedTransactions: AdminTransaction[] = (txData || []).map((tx) => {
        const profile = profiles?.find((p) => p.user_id === tx.user_id);
        return {
          ...tx,
          user_email: profile?.email,
          user_name: profile ? `${profile.first_name} ${profile.last_name}` : undefined,
        };
      });

      setTransactions(enrichedTransactions);

      // Calculate stats from all transactions (not limited)
      const { data: allTx } = await supabase
        .from("transactions")
        .select("type, amount, status, created_at");

      if (allTx) {
        // const funding = allTx
        //   .filter((t) => t.type === "wallet_funding" && t.status === "success")
        //   .reduce((sum, t) => sum + Number(t.amount), 0);

        const funding = allTx
          .filter((t) =>
            ["wallet_funding", "manual_funding", "admin_credit"].includes(t.type) &&
            t.status === "success"
          )
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);


        // const purchases = allTx
        //   .filter((t) => t.type === "purchase" && (t.status === "success" || t.status === "partial"))
        //   .reduce((sum, t) => sum + Number(t.amount), 0);

        const purchases = allTx
          .filter((t) =>
            t.type === "purchase" &&
            (t.status === "success" || t.status === "partial")
          )
          .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);


        // const withdrawals = allTx
        //   .filter((t) =>
        //     t.type === "withdrawal" &&
        //     t.status === "success"
        //   )
        //   .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

        const commissions = allTx
          .filter((t) => t.type === "commission" && t.status === "success")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const pending = allTx.filter((t) => t.status === "pending").length;

        setStats({
          totalFunding: funding,
          totalPurchases: purchases,
          totalCommissions: commissions,
          pendingCount: pending,
        });

        // Calculate daily stats for the last 14 days
        const last14Days: DailyStats[] = [];
        for (let i = 13; i >= 0; i--) {
          const date = startOfDay(subDays(new Date(), i));
          const dateStr = format(date, "yyyy-MM-dd");
          const displayDate = format(date, "MMM d");

          const dayTx = allTx.filter((t) => {
            const txDate = format(new Date(t.created_at), "yyyy-MM-dd");
            return txDate === dateStr && t.status === "success";
          });

          last14Days.push({
            date: displayDate,
            // funding: dayTx
            //   .filter((t) => t.type === "wallet_funding")
            //   .reduce((sum, t) => sum + Number(t.amount), 0),
            funding: dayTx
              .filter((t) =>
                ["wallet_funding", "manual_funding", "admin_credit"].includes(t.type)
              )
              .reduce((sum, t) => sum + Number(t.amount || 0), 0),
            purchases: dayTx
              .filter((t) => t.type === "purchase")
              .reduce((sum, t) => sum + Number(t.amount), 0),
            commissions: dayTx
              .filter((t) => t.type === "commission")
              .reduce((sum, t) => sum + Number(t.amount), 0),
          });
        }

        setDailyStats(last14Days);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [limit]);

  return {
    transactions,
    loading,
    error,
    stats,
    dailyStats,
    refetch: fetchTransactions,
  };
};
