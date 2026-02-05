import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { WalletCard } from "@/components/WalletCard";
import { NetworkBadge } from "@/components/NetworkBadge";
import { TierBadge } from "@/components/TierBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTransactions } from "@/hooks/useTransactions";
import { useCart } from "@/hooks/useCart";
import { usePricingTiers } from "@/hooks/usePricingTiers";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { 
  Smartphone, 
  TrendingUp, 
  Users, 
  Clock,
  ArrowRight,
  Zap,
  ShoppingCart,
  Loader2,
  Trash2,
  Minus,
  Plus
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

const generateIdempotencyKey = () => crypto.randomUUID();

export const DashboardHome = ({ user, walletBalance, userRole, onFundWallet }: DashboardHomeProps) => {
  const userName = user.user_metadata?.first_name || user.email?.split("@")[0] || "User";
  const { transactions, loading: transactionsLoading } = useTransactions(user.id, 5);
  const { 
    addToCart, 
    cartItems, 
    cartTotal, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart(user.id);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Quick Buy dialog state
  const [quickBuyDialogOpen, setQuickBuyDialogOpen] = useState(false);
  const [selectedQuickBuyTier, setSelectedQuickBuyTier] = useState<any>(null);
  const [quickBuyPhoneNumber, setQuickBuyPhoneNumber] = useState("");
  const [isAddingQuickBuyToCart, setIsAddingQuickBuyToCart] = useState(false);
  const [isBuyingQuickBuyNow, setIsBuyingQuickBuyNow] = useState(false);
  const [packageSearchQuery, setPackageSearchQuery] = useState("");
  
  // Get all popular/hot packages for Quick Buy (1GB packages from each network)
  const { tiers: allTiers, loading: tiersLoading } = usePricingTiers(userRole);
  
  // Filter to get hot/popular packages (1GB from each network, or most popular)
  const hotPackages = allTiers.filter((tier) => {
    // Get 1GB packages from each network as "hot" packages
    return tier.data_amount === "1GB" || tier.data_amount === "2GB";
  }).slice(0, 8); // Limit to 8 packages

  const filteredPackages = packageSearchQuery.trim().length
    ? allTiers
        .filter((tier) => {
          const q = packageSearchQuery.trim().toLowerCase();
          const name = String(tier.package_name || "").toLowerCase();
          const amount = String(tier.data_amount || "").toLowerCase();
          const network = String(tier.network || "").toLowerCase();
          return name.includes(q) || amount.includes(q) || network.includes(q);
        })
        .slice(0, 12)
    : hotPackages;

  // Calculate today's purchases
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysPurchases = transactions.filter((tx) => {
    const txDate = new Date(tx.created_at);
    return tx.type === "purchase" && tx.status === "success" && txDate >= today;
  });
  const todaysSpent = todaysPurchases.reduce((sum, tx) => sum + tx.amount, 0);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(0[235][0-9]{8}|233[235][0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handleQuickBuyClick = () => {
    setQuickBuyDialogOpen(true);
    setSelectedQuickBuyTier(null);
    setQuickBuyPhoneNumber("");
  };

  const handleSelectQuickBuyPackage = (tier: any) => {
    setSelectedQuickBuyTier(tier);
    setQuickBuyPhoneNumber("");
  };

  const handleAddQuickBuyToCart = async () => {
    if (!selectedQuickBuyTier || !quickBuyPhoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    if (!validatePhone(quickBuyPhoneNumber)) {
      toast.error("Please enter a valid Ghana phone number");
      return;
    }

    setIsAddingQuickBuyToCart(true);
    try {
      const success = await addToCart(selectedQuickBuyTier.id, quickBuyPhoneNumber.replace(/\s/g, ""));
      
      if (success) {
        toast.success("Added to cart!", {
          description: "Go to cart to proceed to checkout",
          duration: 5000,
        });
        setQuickBuyDialogOpen(false);
        setQuickBuyPhoneNumber("");
        setSelectedQuickBuyTier(null);
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingQuickBuyToCart(false);
    }
  };

  const handleQuickBuyNow = async () => {
    if (!selectedQuickBuyTier || !quickBuyPhoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    if (!validatePhone(quickBuyPhoneNumber)) {
      toast.error("Please enter a valid Ghana phone number");
      return;
    }

    if (walletBalance < Number(selectedQuickBuyTier.price || 0)) {
      toast.error("Insufficient wallet balance. Please fund your wallet first.");
      return;
    }

    setIsBuyingQuickBuyNow(true);
    try {
      const idempotencyKey = generateIdempotencyKey();

      const { data, error } = await supabase.functions.invoke("purchase-data", {
        body: {
          idempotency_key: idempotencyKey,
          pricing_tier_id: selectedQuickBuyTier.id,
          beneficiary_phone: quickBuyPhoneNumber.replace(/\s/g, ""),
          quantity: 1,
        },
      });

      if (error) {
        console.error("Quick buy purchase error:", error);
        toast.error("Purchase failed. Please try again.");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const successCount = data?.results?.filter((r: any) => r.status === "success").length || 0;
      const failedCount = data?.results?.filter((r: any) => r.status === "failed").length || 0;

      if (successCount > 0 && failedCount === 0) {
        toast.success(
          `Purchase successful! ${selectedQuickBuyTier.data_amount} sent to ${quickBuyPhoneNumber}`,
          { description: data?.reference ? `Ref: ${data.reference}` : undefined }
        );
      } else if (successCount > 0) {
        toast.success(
          `Purchase partially completed! ${successCount} succeeded, ${failedCount} failed.`,
          { description: data?.reference ? `Ref: ${data.reference}` : undefined }
        );
      } else {
        toast.info(
          `Purchase processed. ${failedCount} item(s) failed. Amount refunded.`,
          { description: data?.reference ? `Ref: ${data.reference}` : undefined }
        );
      }

      setQuickBuyDialogOpen(false);
      setQuickBuyPhoneNumber("");
      setSelectedQuickBuyTier(null);

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Quick buy purchase error:", err);
      toast.error("Purchase failed. Please try again.");
    } finally {
      setIsBuyingQuickBuyNow(false);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (walletBalance < cartTotal) {
      toast.error("Insufficient wallet balance. Please fund your wallet first.");
      return;
    }

    setIsCheckingOut(true);

    try {
      const idempotencyKey = generateIdempotencyKey();

      const { data, error } = await supabase.functions.invoke("purchase-data", {
        body: {
          idempotency_key: idempotencyKey,
          cart_items: cartItems.map((item) => ({
            pricing_tier_id: item.pricing_tier_id,
            beneficiary_phone: item.beneficiary_phone,
            quantity: item.quantity,
          })),
        },
      });

      if (error) {
        console.error("Checkout error:", error);
        toast.error("Checkout failed. Please try again.");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Check if checkout was processed (success or partial success)
      const wasProcessed = data.success !== false && !data.error;
      
      if (wasProcessed) {
        // Show success message
        const successCount = data.results?.filter((r: any) => r.status === "success").length || 0;
        const failedCount = data.results?.filter((r: any) => r.status === "failed").length || 0;
        
        if (successCount > 0 && failedCount === 0) {
          toast.success("Checkout successful! All data bundles are being processed.", {
            description: data.reference ? `Ref: ${data.reference}` : undefined,
          });
        } else if (successCount > 0) {
          toast.success(
            `Checkout partially completed! ${successCount} succeeded, ${failedCount} failed.`,
            { description: data.reference ? `Ref: ${data.reference}` : undefined }
          );
        } else {
          toast.info(
            `Checkout processed. ${failedCount} item(s) failed. Amount refunded.`,
            { description: data.reference ? `Ref: ${data.reference}` : undefined }
          );
        }

        // Clear cart
        await clearCart();
        
        // Refresh page after a short delay to show the toast
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("Checkout failed. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

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
        <div className="flex items-center gap-3">
          {cartItems.length > 0 && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  <Badge
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    variant="default"
                  >
                    {cartItems.length}
                  </Badge>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Your Cart</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  {cartItems.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Your cart is empty
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <NetworkBadge network={(item.tier?.network || "MTN") as "MTN" | "Airtel" | "Telecel" | "MTN_AFA"} size="sm" />
                                <span className="font-medium text-sm truncate">
                                  {item.tier?.data_amount}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.tier?.package_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                To: {item.beneficiary_phone}
                              </p>
                              <p className="text-sm font-semibold text-primary mt-1">
                                GHS {((item.tier?.price || 0) * item.quantity).toFixed(2)}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-6 text-center text-sm">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-semibold">GHS {cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Wallet Balance</span>
                          <span className={cn(
                            "font-semibold",
                            walletBalance < cartTotal ? "text-destructive" : "text-primary"
                          )}>
                            GHS {walletBalance.toFixed(2)}
                          </span>
                        </div>

                        <Button
                          className="w-full"
                          variant="gold"
                          disabled={isCheckingOut || cartItems.length === 0 || walletBalance < cartTotal}
                          onClick={handleCheckout}
                        >
                          {isCheckingOut ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : walletBalance < cartTotal ? (
                            "Insufficient Balance"
                          ) : (
                            `Checkout - GHS ${cartTotal.toFixed(2)}`
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
          <Button variant="gold" onClick={handleQuickBuyClick}>
            <Zap className="w-4 h-4" />
            Quick Buy
          </Button>
        </div>
      </div>

      {/* Wallet Card */}
      <div>
        <WalletCard 
          balance={walletBalance} 
          onFund={onFundWallet}
        />
      </div>

      {/* Quick Buy Data Section */}
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">
          Quick Buy Data
        </h2>

        <div className="max-w-md mb-4">
          <Label htmlFor="package-search" className="sr-only">
            Search data package
          </Label>
          <Input
            id="package-search"
            placeholder="Search package name (e.g., 1GB Daily, 5GB Monthly)..."
            value={packageSearchQuery}
            onChange={(e) => setPackageSearchQuery(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Showing packages for your role: <span className="font-medium">{userRole}</span>
          </p>
        </div>

        {tiersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No packages match your search
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPackages.map((tier: any) => (
              <button
                key={tier.id}
                className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all text-left group"
                onClick={() => {
                  setSelectedQuickBuyTier(tier);
                  setQuickBuyPhoneNumber("");
                  setQuickBuyDialogOpen(true);
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <NetworkBadge network={tier.network as "MTN" | "Airtel" | "Telecel" | "MTN_AFA"} size="sm" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-medium text-foreground">
                  {tier.data_amount} - {tier.package_name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  GHS {Number(tier.price).toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
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

      {/* Quick Buy Dialog */}
      <Dialog open={quickBuyDialogOpen} onOpenChange={setQuickBuyDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Buy Data</DialogTitle>
            <DialogDescription>
              Select a popular data package and add recipient phone number to cart
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Package Selection */}
            {!selectedQuickBuyTier ? (
              <>
                {tiersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : hotPackages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No packages available
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotPackages.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => handleSelectQuickBuyPackage(tier)}
                        className="p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <NetworkBadge network={tier.network as "MTN" | "Airtel" | "Telecel" | "MTN_AFA"} size="sm" />
                        </div>
                        <p className="font-display text-xl font-bold text-foreground">
                          {tier.data_amount}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {tier.package_name}
                        </p>
                        <p className="text-lg font-semibold text-primary mt-3">
                          GHS {Number(tier.price).toFixed(2)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Selected Package Display */}
                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <NetworkBadge network={selectedQuickBuyTier.network as "MTN" | "Airtel" | "Telecel" | "MTN_AFA"} size="sm" />
                        <span className="font-medium text-sm">{selectedQuickBuyTier.data_amount}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedQuickBuyTier.package_name}</p>
                      <p className="text-lg font-semibold text-primary mt-2">
                        GHS {Number(selectedQuickBuyTier.price).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedQuickBuyTier(null)}
                    >
                      Change Package
                    </Button>
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="space-y-2">
                  <Label htmlFor="quick-buy-phone">Beneficiary Phone Number</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="quick-buy-phone"
                      type="tel"
                      placeholder="e.g., 0241234567"
                      value={quickBuyPhoneNumber}
                      onChange={(e) => setQuickBuyPhoneNumber(e.target.value)}
                      className="pl-10"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddQuickBuyToCart();
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the phone number to receive the data bundle
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedQuickBuyTier(null);
                      setQuickBuyPhoneNumber("");
                    }}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    variant="gold"
                    onClick={handleAddQuickBuyToCart}
                    disabled={!quickBuyPhoneNumber || isAddingQuickBuyToCart}
                    className="flex-1"
                  >
                    {isAddingQuickBuyToCart ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleQuickBuyNow}
                    disabled={!quickBuyPhoneNumber || isBuyingQuickBuyNow}
                    className="flex-1"
                  >
                    {isBuyingQuickBuyNow ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Buying...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Receipt = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
