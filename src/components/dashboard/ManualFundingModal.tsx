import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Wallet, Phone, Copy, Check, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ManualFundingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const MOMO_ACCOUNTS = [
  { network: "MTN", number: "05494248172", name: "Champion Man GoDey" },
  { network: "AirtelTigo", number: "0562200415", name: "Champion Man GoDey" },
  { network: "Telecel", number: "0202739539", name: "Champion Man GoDey" },
];

export const ManualFundingModal = ({
  open,
  onOpenChange,
  onSuccess,
}: ManualFundingModalProps) => {
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    toast.success("Number copied to clipboard");
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount < 1) {
      toast.error("Please enter a valid amount (minimum GHS 1.00)");
      return;
    }

    if (!network) {
      toast.error("Please select the network you used");
      return;
    }

    if (!transactionId.trim()) {
      toast.error("Please enter the transaction ID");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to submit a funding request");
        return;
      }

      const { error } = await supabase
        .from("manual_funding_requests")
        .insert({
          user_id: session.user.id,
          amount: parsedAmount,
          network: network,
          transaction_id: transactionId.trim(),
        });

      if (error) {
        console.error("Error submitting request:", error);
        toast.error("Failed to submit request. Please try again.");
        return;
      }

      toast.success("Funding request submitted! We'll review it shortly.");
      setAmount("");
      setNetwork("");
      setTransactionId("");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Manual Wallet Funding
          </DialogTitle>
          <DialogDescription>
            Send money to our MoMo account and submit the transaction details for verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: MoMo Numbers */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Step 1: Send money to any of these numbers
            </Label>
            <div className="space-y-2">
              {MOMO_ACCOUNTS.map((account) => (
                <div
                  key={account.network}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{account.network}</p>
                      <p className="text-xs text-muted-foreground">{account.name}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyNumber(account.number)}
                    className="flex items-center gap-1"
                  >
                    {copiedNumber === account.number ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="font-mono">{account.number}</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Enter Details */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Step 2: Enter your payment details
            </Label>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="manual-amount">Amount Sent</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  GHS
                </span>
                <Input
                  id="manual-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>

            {/* Network */}
            <div className="space-y-2">
              <Label>Network Used</Label>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                  <SelectItem value="AirtelTigo">AirtelTigo Money</SelectItem>
                  <SelectItem value="Telecel">Telecel Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transaction ID */}
            <div className="space-y-2">
              <Label htmlFor="transaction-id">Transaction ID / Reference</Label>
              <Input
                id="transaction-id"
                type="text"
                placeholder="e.g., TXN123456789"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You can find this in your MoMo confirmation SMS
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 border border-border">
            <AlertCircle className="w-5 h-5 text-accent-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-accent-foreground">Important</p>
              <p className="text-muted-foreground">
                Your wallet will be credited after we verify the transaction. This usually takes 5-30 minutes.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !amount || !network || !transactionId}
            className="w-full"
            variant="gold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Submit for Verification
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
