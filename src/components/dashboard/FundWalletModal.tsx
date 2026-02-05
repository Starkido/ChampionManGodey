import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wallet, CreditCard, Phone } from "lucide-react";
import { toast } from "sonner";
import { ManualFundingModal } from "./ManualFundingModal";

interface FundWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const presetAmounts = [10, 20, 50, 100, 200, 500];

export const FundWalletModal = ({
  open,
  onOpenChange,
  onSuccess,
}: FundWalletModalProps) => {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showManualFunding, setShowManualFunding] = useState(false);

  // Paystack payment callback and verification - Commented out until Paystack is configured
  // Check for payment callback in URL
  // useEffect(() => {
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const paymentStatus = urlParams.get("payment");
  //   const reference = urlParams.get("reference");

  //   if (paymentStatus === "success" && reference) {
  //     // Clean up URL
  //     window.history.replaceState({}, document.title, window.location.pathname);
      
  //     // Verify the payment
  //     verifyPayment(reference);
  //   }
  // }, []);

  // const verifyPayment = async (reference: string) => {
  //   setVerifying(true);
  //   try {
  //     const { data: { session } } = await supabase.auth.getSession();
  //     if (!session) {
  //       toast.error("Please log in to verify payment");
  //       return;
  //     }

  //     const { data, error } = await supabase.functions.invoke("verify-payment", {
  //       body: { reference },
  //     });

  //     if (error) {
  //       console.error("Verification error:", error);
  //       toast.error("Failed to verify payment. Please contact support.");
  //       return;
  //     }

  //     if (data.success) {
  //       toast.success(`Payment successful! GHS ${data.amount.toFixed(2)} added to wallet`);
  //       onSuccess();
  //     } else {
  //       toast.error(data.error || "Payment verification failed");
  //     }
  //   } catch (err) {
  //     console.error("Verification error:", err);
  //     toast.error("Failed to verify payment");
  //   } finally {
  //     setVerifying(false);
  //   }
  // };

  // const handleInitializePayment = async () => {
  //   const parsedAmount = parseFloat(amount);
    
  //   if (isNaN(parsedAmount) || parsedAmount < 1) {
  //     toast.error("Please enter a valid amount (minimum GHS 1.00)");
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     const { data: { session } } = await supabase.auth.getSession();
  //     if (!session) {
  //       toast.error("Please log in to fund your wallet");
  //       return;
  //     }

  //     const { data, error } = await supabase.functions.invoke("initialize-payment", {
  //       body: { amount: parsedAmount },
  //     });

  //     if (error) {
  //       console.error("Payment init error:", error);
  //       toast.error("Failed to initialize payment");
  //       return;
  //     }

  //     if (data.authorization_url) {
  //       // Redirect to Paystack
  //       window.location.href = data.authorization_url;
  //     } else {
  //       toast.error("Failed to get payment URL");
  //     }
  //   } catch (err) {
  //     console.error("Payment error:", err);
  //     toast.error("Failed to initialize payment");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Payment verification dialog - Commented out until Paystack is configured
  // if (verifying) {
  //   return (
  //     <Dialog open={true}>
  //       <DialogContent className="sm:max-w-md">
  //         <div className="flex flex-col items-center justify-center py-12">
  //           <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
  //           <p className="text-lg font-medium">Verifying payment...</p>
  //           <p className="text-sm text-muted-foreground">Please wait</p>
  //         </div>
  //       </DialogContent>
  //     </Dialog>
  //   );
  // }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Fund Your Wallet
            </DialogTitle>
            <DialogDescription>
              Choose your preferred payment method
            </DialogDescription>
          </DialogHeader>

          {/* Temporarily removed Tabs - only showing Manual Transfer until Paystack is configured */}
          {/* <Tabs defaultValue="online" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="online" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Online Payment
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Manual Transfer
              </TabsTrigger>
            </TabsList> */}

            {/* Online Payment Section - Commented out until Paystack is configured */}
            {/* <TabsContent value="online" className="space-y-6 py-4">
              {/* Preset amounts */}
              {/* <div>
                <Label className="text-sm text-muted-foreground mb-3 block">
                  Quick select
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                    >
                      GHS {preset}
                    </Button>
                  ))}
                </div>
              </div> */}

              {/* Custom amount input */}
              {/* <div className="space-y-2">
                <Label htmlFor="amount">Or enter custom amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    GHS
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-12"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum amount: GHS 1.00
                </p>
              </div> */}

              {/* Payment info */}
              {/* <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Secure payment via Paystack</p>
                  <p className="text-muted-foreground">
                    Pay with Mobile Money, Visa, Mastercard, or Bank Transfer
                  </p>
                </div>
              </div> */}

              {/* Action button */}
              {/* <Button
                onClick={handleInitializePayment}
                disabled={isLoading || !amount || parseFloat(amount) < 1}
                className="w-full"
                variant="gold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay GHS {amount || "0.00"}
                  </>
                )}
              </Button>
            </TabsContent> */}

            {/* Manual Transfer Section - Currently Active */}
            <div className="py-4">
              <div className="text-center space-y-4">
                <div className="p-6 rounded-lg bg-muted/50">
                  <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Manual Bank/MoMo Transfer</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send money directly to our mobile money account and submit the transaction details for verification.
                  </p>
                  <Button
                    variant="gold"
                    className="w-full"
                    onClick={() => {
                      onOpenChange(false);
                      setShowManualFunding(true);
                    }}
                  >
                    <Phone className="w-4 h-4" />
                    Proceed to Manual Funding
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Processing time: 5-30 minutes after verification
                </p>
              </div>
            </div>
          {/* </Tabs> */}
        </DialogContent>
      </Dialog>

      <ManualFundingModal
        open={showManualFunding}
        onOpenChange={setShowManualFunding}
        onSuccess={onSuccess}
      />
    </>
  );
};
