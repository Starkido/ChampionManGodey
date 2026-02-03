import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  referral_code: string | null;
  referred_by: string | null;
}

interface UserData {
  profile: UserProfile | null;
  role: AppRole;
  walletBalance: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserData = (userId: string | undefined): UserData => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole>("client");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch profile, role, and wallet in parallel
      const [profileResult, roleResult, walletResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, first_name, last_name, phone, referral_code, referred_by")
          .eq("user_id", userId)
          .single(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .single(),
        supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", userId)
          .single(),
      ]);

      if (profileResult.error) {
        console.error("Profile fetch error:", profileResult.error);
      } else {
        setProfile(profileResult.data);
      }

      if (roleResult.error) {
        console.error("Role fetch error:", roleResult.error);
      } else {
        setRole(roleResult.data.role);
      }

      if (walletResult.error) {
        console.error("Wallet fetch error:", walletResult.error);
      } else {
        setWalletBalance(Number(walletResult.data.balance) || 0);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  return {
    profile,
    role,
    walletBalance,
    loading,
    error,
    refetch: fetchUserData,
  };
};
