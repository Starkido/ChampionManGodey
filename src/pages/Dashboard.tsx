import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { BuyDataPage } from "@/components/dashboard/BuyDataPage";
import { TransactionsPage } from "@/components/dashboard/TransactionsPage";
import { ReferralsPage } from "@/components/dashboard/ReferralsPage";
import { SettingsPage } from "@/components/dashboard/SettingsPage";
import { FundWalletModal } from "@/components/dashboard/FundWalletModal";
import { useUserData } from "@/hooks/useUserData";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const [fundWalletOpen, setFundWalletOpen] = useState(false);

  const { profile, role, walletBalance, refetch: refetchUserData } = useUserData(user?.id);

  // Handle payment callback
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const reference = searchParams.get("reference");

    if (paymentStatus === "success" && reference) {
      // Clean up URL params
      setSearchParams({});
      
      // Verify payment
      verifyPayment(reference);
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { reference },
      });

      if (error) {
        console.error("Verification error:", error);
        toast.error("Failed to verify payment");
        return;
      }

      if (data.success) {
        toast.success(`Payment successful! GHS ${data.amount.toFixed(2)} added to wallet`);
        refetchUserData();
      } else {
        toast.error(data.error || "Payment verification failed");
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Failed to verify payment");
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleFundWallet = () => {
    setFundWalletOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <DashboardLayout 
        user={user}
        userRole={role}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
      >
        {activeSection === "home" && (
          <DashboardHome 
            user={user} 
            walletBalance={walletBalance}
            userRole={role}
            onFundWallet={handleFundWallet}
          />
        )}
        {activeSection === "buy-data" && (
          <BuyDataPage 
            user={user} 
            userRole={role}
            walletBalance={walletBalance}
          />
        )}
        {activeSection === "transactions" && (
          <TransactionsPage user={user} />
        )}
        {activeSection === "referrals" && (
          <ReferralsPage 
            user={user} 
            referralCode={profile?.referral_code || null}
          />
        )}
        {activeSection === "settings" && (
          <SettingsPage 
            user={user}
            profile={profile}
            role={role}
            onProfileUpdate={refetchUserData}
          />
        )}
      </DashboardLayout>

      <FundWalletModal
        open={fundWalletOpen}
        onOpenChange={setFundWalletOpen}
        onSuccess={() => {
          setFundWalletOpen(false);
          refetchUserData();
        }}
      />
    </>
  );
};

export default Dashboard;
