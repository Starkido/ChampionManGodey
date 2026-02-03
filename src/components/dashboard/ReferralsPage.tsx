import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { useReferrals } from "@/hooks/useReferrals";
import { useWithdrawals } from "@/hooks/useWithdrawals";
import { useUserData } from "@/hooks/useUserData";
import { WithdrawModal } from "./WithdrawModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Copy,
  Check,
  Gift,
  TrendingUp,
  UserPlus,
  Loader2,
  Share2,
  Banknote,
  ArrowDownCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ReferralsPageProps {
  user: User;
  referralCode: string | null;
}

export const ReferralsPage = ({ user, referralCode }: ReferralsPageProps) => {
  const { referrals, totalEarnings, loading, error } = useReferrals(user.id);
  const { walletBalance, refetch: refetchUserData } = useUserData(user.id);
  const { withdrawals, isLoading: withdrawalsLoading, refetch: refetchWithdrawals } = useWithdrawals(user.id);
  const [copied, setCopied] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const referralLink = referralCode
    ? `${window.location.origin}/auth?ref=${referralCode}`
    : null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const shareReferral = async () => {
    if (!referralLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on DataHub",
          text: "Sign up using my referral link and get great deals on data bundles!",
          url: referralLink,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      copyToClipboard(referralLink);
    }
  };

  const completedReferrals = referrals.filter((r) => r.status === "completed");
  const pendingReferrals = referrals.filter((r) => r.status === "pending");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Referrals
        </h1>
        <p className="text-muted-foreground mt-1">
          Invite friends and earn commissions on their purchases
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {referrals.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  GHS {totalEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Referrals</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {completedReferrals.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    GHS {walletBalance.toFixed(2)}
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => setWithdrawModalOpen(true)}
                disabled={walletBalance < 5}
              >
                <ArrowDownCircle className="w-4 h-4 mr-1" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Share your unique referral link with friends. When they sign up and make
            purchases, you'll earn commissions!
          </p>

          {referralCode ? (
            <>
              <div className="flex gap-2">
                <Input
                  value={referralLink || ""}
                  readOnly
                  className="font-mono text-sm bg-background"
                />
                <Button
                  variant="outline"
                  onClick={() => referralLink && copyToClipboard(referralLink)}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button variant="gold" onClick={shareReferral}>
                  <Share2 className="w-4 h-4" />
                  Share Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => referralCode && copyToClipboard(referralCode)}
                >
                  <Copy className="w-4 h-4" />
                  Copy Code: {referralCode}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your referral code is being generated...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error}</div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No referrals yet</p>
              <p className="text-sm text-muted-foreground">
                Share your referral link to start earning commissions
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        {format(new Date(referral.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            referral.status === "completed"
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                          )}
                        >
                          {referral.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          +GHS {Number(referral.commission).toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownCircle className="w-5 h-5" />
            Withdrawal History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawalsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <Banknote className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No withdrawals yet</p>
              <p className="text-sm text-muted-foreground">
                Request a withdrawal when you have earnings in your wallet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        {format(new Date(withdrawal.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-semibold">
                        GHS {Number(withdrawal.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{withdrawal.network}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {withdrawal.phone_number}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            withdrawal.status === "completed"
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : withdrawal.status === "rejected"
                              ? "bg-red-500/10 text-red-600 border-red-500/20"
                              : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                          )}
                        >
                          {withdrawal.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <WithdrawModal
        open={withdrawModalOpen}
        onOpenChange={setWithdrawModalOpen}
        walletBalance={walletBalance}
        userId={user.id}
        onSuccess={() => {
          refetchUserData();
          refetchWithdrawals();
        }}
      />
    </div>
  );
};
