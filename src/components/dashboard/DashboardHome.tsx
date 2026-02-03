import { User } from "@supabase/supabase-js";
import { WalletCard } from "@/components/WalletCard";
import { NetworkBadge } from "@/components/NetworkBadge";
import { TierBadge } from "@/components/TierBadge";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import { Database } from "@/integrations/supabase/types";
import { 
  Smartphone, 
  TrendingUp, 
  Users, 
  Clock,
  ArrowRight,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type AppRole = Database["public"]["Enums"]["app_role"];

interface DashboardHomeProps {
  user: User;
  walletBalance: number;
  userRole: AppRole;
  onFundWallet: () => void;
}

const quickActions = [
  { network: "MTN" as const, popular: "1GB @ GHS 4.50" },
  { network: "Airtel" as const, popular: "2GB @ GHS 8.00" },
  { network: "Telecel" as const, popular: "1GB @ GHS 5.00" },
  { network: "MTN_AFA" as const, popular: "2GB @ GHS 9.00" },
];

export const DashboardHome = ({ user, walletBalance, userRole, onFundWallet }: DashboardHomeProps) => {
  const userName = user.user_metadata?.first_name || user.email?.split("@")[0] || "User";
  const { transactions, loading: transactionsLoading } = useTransactions(user.id, 5);

  // Calculate today's purchases
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysPurchases = transactions.filter((tx) => {
    const txDate = new Date(tx.created_at);
    return tx.type === "purchase" && tx.status === "success" && txDate >= today;
  });
  const todaysSpent = todaysPurchases.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your account today.
          </p>
        </div>
        <Button variant="gold">
          <Zap className="w-4 h-4" />
          Quick Buy
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <WalletCard 
          balance={walletBalance} 
          onFund={onFundWallet}
          className="sm:col-span-2"
        />
        
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Today's Purchases</span>
          </div>
          <p className="font-display text-3xl font-bold text-foreground">{todaysPurchases.length}</p>
          <p className="text-sm text-muted-foreground mt-1">GHS {todaysSpent.toFixed(2)} spent</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">Your Tier</span>
          </div>
          <TierBadge tier={userRole} size="lg" />
          <p className="text-sm text-muted-foreground mt-2">Role-based pricing</p>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">
          Quick Buy Data
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.network}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all text-left group"
              onClick={() => toast.info(`Buy ${action.network} data feature coming soon!`)}
            >
              <div className="flex items-center justify-between mb-3">
                <NetworkBadge network={action.network} size="sm" />
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-medium text-foreground">{action.popular}</p>
              <p className="text-sm text-muted-foreground">Most popular</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Recent Activity
          </h2>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          {transactionsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="divide-y divide-border">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="p-4 bg-card hover:bg-muted/50 transition-colors flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === "wallet_funding" || tx.type === "commission" ? "bg-success/10" : "bg-primary/10"
                  }`}>
                    {tx.type === "wallet_funding" || tx.type === "commission" ? (
                      <TrendingUp className="w-5 h-5 text-success" />
                    ) : (
                      <Smartphone className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {tx.type === "wallet_funding" 
                        ? "Wallet Funded" 
                        : tx.type === "commission"
                        ? "Referral Commission"
                        : `Data Purchase`}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.type === "wallet_funding" || tx.type === "commission" 
                        ? "text-success" 
                        : "text-foreground"
                    }`}>
                      {tx.type === "wallet_funding" || tx.type === "commission" ? "+" : "-"}GHS {tx.amount.toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tx.status === "success" 
                        ? "bg-success/10 text-success"
                        : tx.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-600"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground">
                Fund your wallet to start purchasing data bundles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Receipt = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
