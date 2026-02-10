// import { useState, useEffect } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { Database } from "@/integrations/supabase/types";
// import { AdminUser } from "@/types/admin-user";

// type AppRole = Database["public"]["Enums"]["app_role"];

// // interface AdminUser {
// //   id: string;
// //   user_id: string;
// //   email: string;
// //   first_name: string;
// //   last_name: string;
// //   phone: string;
// //   referral_code: string | null;
// //   created_at: string;
// //   role: AppRole;
// //   wallet_balance: number;
// // }

// interface UseAdminUsersResult {
//   users: AdminUser[];
//   loading: boolean;
//   error: string | null;
//   refetch: () => Promise<void>;
//   updateUserRole: (userId: string, newRole: AppRole) => Promise<boolean>;
//   bulkUpdateRoles: (userIds: string[], newRole: AppRole) => Promise<{ success: number; failed: number }>;
//   creditUserWallet: (userId: string, amount: number, reason: string) => Promise<boolean>;
// }

// export const useAdminUsers = (): UseAdminUsersResult => {
//   const [users, setUsers] = useState<AdminUser[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Fetch profiles
//       const { data: profiles, error: profilesError } = await supabase
//         .from("profiles")
//         .select("*")
//         .order("created_at", { ascending: false });

//       if (profilesError) throw profilesError;

//       // Fetch roles
//       const { data: roles, error: rolesError } = await supabase
//         .from("user_roles")
//         .select("user_id, role");

//       if (rolesError) throw rolesError;

//       // Fetch wallets
//       const { data: wallets, error: walletsError } = await supabase
//         .from("wallets")
//         .select("user_id, balance");

//       if (walletsError) throw walletsError;

//       // Combine data
//       const combinedUsers: AdminUser[] = (profiles || []).map((profile) => {
//         const userRole = roles?.find((r) => r.user_id === profile.user_id);
//         const userWallet = wallets?.find((w) => w.user_id === profile.user_id);




//         return {
//           id: profile.id,
//           user_id: profile.user_id,
//           email: profile.email,
//           first_name: profile.first_name,
//           last_name: profile.last_name,
//           phone: profile.phone,
//           referral_code: profile.referral_code,
//           created_at: profile.created_at,
//           role: userRole?.role || "client",
//           wallet_balance: Number(userWallet?.balance) || 0,
//           is_blocked: profile.is_blocked || false,
//         };
//       });

//       setUsers(combinedUsers);
//     } catch (err) {
//       console.error("Error fetching users:", err);
//       setError("Failed to load users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateUserRole = async (userId: string, newRole: AppRole): Promise<boolean> => {
//     try {
//       const { error } = await supabase
//         .from("user_roles")
//         .update({ role: newRole })
//         .eq("user_id", userId);

//       if (error) throw error;

//       // Update local state
//       setUsers((prev) =>
//         prev.map((user) =>
//           user.user_id === userId ? { ...user, role: newRole } : user
//         )
//       );

//       return true;
//     } catch (err) {
//       console.error("Error updating role:", err);
//       return false;
//     }
//   };

//   const bulkUpdateRoles = async (
//     userIds: string[],
//     newRole: AppRole
//   ): Promise<{ success: number; failed: number }> => {
//     let success = 0;
//     let failed = 0;

//     for (const userId of userIds) {
//       const result = await updateUserRole(userId, newRole);
//       if (result) {
//         success++;
//       } else {
//         failed++;
//       }
//     }

//     return { success, failed };
//   };

//   const creditUserWallet = async (
//     userId: string,
//     amount: number,
//     reason: string
//   ): Promise<boolean> => {
//     try {
//       // Get current wallet
//       const { data: wallet, error: walletError } = await supabase
//         .from("wallets")
//         .select("id, balance")
//         .eq("user_id", userId)
//         .single();

//       if (walletError) throw walletError;

//       const newBalance = Number(wallet.balance) + amount;

//       // Update wallet
//       const { error: updateError } = await supabase
//         .from("wallets")
//         .update({ balance: newBalance, updated_at: new Date().toISOString() })
//         .eq("id", wallet.id);

//       if (updateError) throw updateError;

//       // Create transaction record
//       const { error: txError } = await supabase.from("transactions").insert({
//         user_id: userId,
//         type: "admin_credit",
//         amount: amount,
//         status: "success",
//         reference: `ADM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
//         metadata: { reason, credited_by: "admin" },
//       });

//       if (txError) {
//         console.error("Transaction record error:", txError);
//         // Continue even if transaction record fails
//       }

//       // Update local state
//       setUsers((prev) =>
//         prev.map((user) =>
//           user.user_id === userId ? { ...user, wallet_balance: newBalance } : user
//         )
//       );

//       return true;
//     } catch (err) {
//       console.error("Error crediting wallet:", err);
//       return false;
//     }
//   };


//   const blockUser = async (userId: string, blocked: boolean): Promise<boolean> => {
//         const { error } = await supabase.rpc("admin_set_user_blocked", {
//           p_user_id: userId,
//           p_blocked: blocked,
//         });

//         if (error) {
//           console.error(error);
//           return false;
//         }

//         await fetchUsers();
//         return true;
//       };


//       const debitUserWallet = async (
//         userId: string,
//         amount: number,
//         reason: string
//       ): Promise<boolean> => {
//         const { error } = await supabase.rpc("admin_debit_wallet", {
//           p_user_id: userId,
//           p_amount: amount,
//           p_reason: reason,
//         });

//         if (error) {
//           console.error(error);
//           return false;
//         }

//           await fetchUsers();
//           return true;
//         };


//         const updateUserProfile = async (
//           userId: string,
//           firstName: string,
//           lastName: string,
//           phone: string
//         ): Promise<boolean> => {
//           const { error } = await supabase.rpc("admin_update_profile", {
//             p_user_id: userId,
//             p_first_name: firstName,
//             p_last_name: lastName,
//             p_phone: phone,
//           });

//           if (error) {
//             console.error(error);
//             return false;
//           }

//           await fetchUsers();
//           return true;
//         };

//         const clearUserCart = async (userId: string): Promise<boolean> => {
//         const { error } = await supabase.rpc("admin_clear_cart", {
//           p_user_id: userId,
//         });

//         if (error) {
//           console.error(error);
//           return false;
//         }

//         return true;
//       };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   return {
//     users,
//     loading,
//     error,
//     refetch: fetchUsers,
//     updateUserRole,
//     bulkUpdateRoles,
//     creditUserWallet,

//     blockUser,
//     debitUserWallet,
//     updateUserProfile,
//     clearUserCart,
//   };
// };



import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { AdminUser } from "@/types/admin-user";

type AppRole = Database["public"]["Enums"]["app_role"];

export interface UseAdminUsersResult {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateUserRole: (userId: string, newRole: AppRole) => Promise<boolean>;
  bulkUpdateRoles: (userIds: string[], newRole: AppRole) => Promise<{ success: number; failed: number }>;
  creditUserWallet: (userId: string, amount: number, reason: string) => Promise<boolean>;
  blockUser: (userId: string, blocked: boolean) => Promise<boolean>;
  debitUserWallet: (userId: string, amount: number, reason: string) => Promise<boolean>;
  updateUserProfile: (userId: string, firstName: string, lastName: string, phone: string) => Promise<boolean>;
  clearUserCart: (userId: string) => Promise<boolean>;
}

export const useAdminUsers = (): UseAdminUsersResult => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetch all users, roles, wallets and combine data */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rolesError) throw rolesError;

      const { data: wallets, error: walletsError } = await supabase
        .from("wallets")
        .select("user_id, balance");
      if (walletsError) throw walletsError;

      const combinedUsers: AdminUser[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        const userWallet = wallets?.find((w) => w.user_id === profile.user_id);

        return {
          id: profile.id,
          user_id: profile.user_id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          referral_code: profile.referral_code,
          created_at: profile.created_at,
          role: (userRole?.role as AppRole) || "client",
          wallet_balance: Number(userWallet?.balance) || 0,
          is_blocked: profile.is_blocked || false,
        };
      });

      setUsers(combinedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /** Update a single user's role */
  const updateUserRole = async (userId: string, newRole: AppRole): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
      if (error) throw error;

      setUsers((prev) =>
        prev.map((user) => (user.user_id === userId ? { ...user, role: newRole } : user))
      );
      return true;
    } catch (err) {
      console.error("Error updating role:", err);
      return false;
    }
  };

  /** Bulk update roles */
  const bulkUpdateRoles = async (userIds: string[], newRole: AppRole) => {
    let success = 0;
    let failed = 0;

    for (const id of userIds) {
      const result = await updateUserRole(id, newRole);
      result ? success++ : failed++;
    }

    return { success, failed };
  };

  /** Credit user wallet */
  const creditUserWallet = async (userId: string, amount: number, reason: string) => {
    try {
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("user_id", userId)
        .single();
      if (walletError) throw walletError;

      const newBalance = Number(wallet.balance) + amount;

      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("id", wallet.id);
      if (updateError) throw updateError;

      await supabase.from("transactions").insert({
        user_id: userId,
        type: "admin_credit",
        amount,
        status: "success",
        reference: `ADM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        metadata: { reason, credited_by: "admin" },
      });

      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, wallet_balance: newBalance } : u))
      );

      return true;
    } catch (err) {
      console.error("Error crediting wallet:", err);
      return false;
    }
  };

  /** Block / unblock user */
  const blockUser = async (userId: string, blocked: boolean) => {
    const { error } = await supabase.rpc("admin_set_user_blocked", {
      p_user_id: userId,
      p_blocked: blocked,
    });
    if (error) {
      console.error("Error blocking user:", error);
      return false;
    }
    await fetchUsers();
    return true;
  };

  /** Debit user wallet */
  const debitUserWallet = async (userId: string, amount: number, reason: string) => {
    const { error } = await supabase.rpc("admin_debit_wallet", {
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason,
    });
    if (error) {
      console.error("Error debiting wallet:", error);
      return false;
    }
    await fetchUsers();
    return true;
  };

  /** Update user profile */
  const updateUserProfile = async (userId: string, firstName: string, lastName: string, phone: string) => {
    const { error } = await supabase.rpc("admin_update_profile", {
      p_user_id: userId,
      p_first_name: firstName,
      p_last_name: lastName,
      p_phone: phone,
    });
    if (error) {
      console.error("Error updating profile:", error);
      return false;
    }
    await fetchUsers();
    return true;
  };

  /** Clear user cart */
  const clearUserCart = async (userId: string) => {
    const { error } = await supabase.rpc("admin_clear_cart", { p_user_id: userId });
    if (error) {
      console.error("Error clearing cart:", error);
      return false;
    }
    return true;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    updateUserRole,
    bulkUpdateRoles,
    creditUserWallet,
    blockUser,
    debitUserWallet,
    updateUserProfile,
    clearUserCart,
  };
};

