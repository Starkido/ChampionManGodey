import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Loader2, Banknote } from "lucide-react";

const withdrawSchema = z.object({
  amount: z.number().min(5, "Minimum withdrawal is GHS 5").max(10000, "Maximum withdrawal is GHS 10,000"),
  phoneNumber: z.string().regex(/^0[235]\d{8}$/, "Enter valid Ghana phone number (e.g., 0241234567)"),
  network: z.enum(["MTN", "Telecel", "AirtelTigo"], { required_error: "Select a network" }),
});

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletBalance: number;
  userId: string;
  onSuccess: () => void;
}

export const WithdrawModal = ({
  open,
  onOpenChange,
  walletBalance,
  userId,
  onSuccess,
}: WithdrawModalProps) => {
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [network, setNetwork] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setAmount("");
    setPhoneNumber("");
    setNetwork("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const numAmount = parseFloat(amount);

    // Validate
    const result = withdrawSchema.safeParse({
      amount: numAmount,
      phoneNumber,
      network,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (numAmount > walletBalance) {
      setErrors({ amount: "Insufficient wallet balance" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("request-withdrawal", {
        body: {
          amount: numAmount,
          phoneNumber,
          network,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Withdrawal request submitted successfully!");
        resetForm();
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(data.error || "Failed to submit withdrawal request");
      }
    } catch (err: any) {
      console.error("Withdrawal error:", err);
      toast.error(err.message || "Failed to submit withdrawal request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-primary" />
            Withdraw to Mobile Money
          </DialogTitle>
          <DialogDescription>
            Available balance: <span className="font-semibold text-foreground">GHS {walletBalance.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (GHS)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="5"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={errors.amount ? "border-destructive" : ""}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="network">Mobile Network</Label>
            <Select value={network} onValueChange={setNetwork}>
              <SelectTrigger className={errors.network ? "border-destructive" : ""}>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                <SelectItem value="Telecel">Telecel Cash</SelectItem>
                <SelectItem value="AirtelTigo">AirtelTigo Money</SelectItem>
              </SelectContent>
            </Select>
            {errors.network && (
              <p className="text-sm text-destructive">{errors.network}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Mobile Money Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="e.g., 0241234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={errors.phoneNumber ? "border-destructive" : ""}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
            <p>• Minimum withdrawal: GHS 5.00</p>
            <p>• Withdrawals are processed within 24 hours</p>
            <p>• Amount will be deducted from your wallet upon request</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Request Withdrawal"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
