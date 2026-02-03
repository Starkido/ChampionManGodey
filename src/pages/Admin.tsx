import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminPricing } from "@/components/admin/AdminPricing";
import { AdminTransactions } from "@/components/admin/AdminTransactions";
import { AdminWithdrawals } from "@/components/admin/AdminWithdrawals";
import { AdminManualFunding } from "@/components/admin/AdminManualFunding";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        setUser(session.user);

        // Check if user is admin
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (roleError || roleData?.role !== "admin") {
          toast.error("Access denied. Admin privileges required.");
          navigate("/dashboard");
          return;
        }

        setIsAdmin(true);
      } catch (err) {
        console.error("Admin check error:", err);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Checking admin access...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout
      user={user}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={handleLogout}
    >
      {activeSection === "overview" && <AdminOverview />}
      {activeSection === "users" && <AdminUsers />}
      {activeSection === "manual-funding" && <AdminManualFunding />}
      {activeSection === "withdrawals" && <AdminWithdrawals />}
      {activeSection === "pricing" && <AdminPricing />}
      {activeSection === "transactions" && <AdminTransactions />}
      {activeSection === "analytics" && (
        <div className="p-8">
          <h1 className="font-display text-2xl font-bold mb-4">Analytics</h1>
          <p className="text-muted-foreground">
            Advanced analytics and reporting coming soon.
          </p>
        </div>
      )}
      {activeSection === "settings" && (
        <div className="p-8">
          <h1 className="font-display text-2xl font-bold mb-4">Admin Settings</h1>
          <p className="text-muted-foreground">
            System configuration and settings coming soon.
          </p>
        </div>
      )}
    </AdminLayout>
  );
};

export default Admin;
