import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  referral_code: string | null;
  created_at: string;

  role: AppRole;
  wallet_balance: number;
  is_blocked: boolean;
}
