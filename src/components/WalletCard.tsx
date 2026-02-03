import { useState } from "react";
import { cn } from "@/lib/utils";
import { Wallet, Plus, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";

interface WalletCardProps {
  balance: number;
  currency?: string;
  onFund?: () => void;
  className?: string;
}

export const WalletCard = ({ 
  balance, 
  currency = "GHS", 
  onFund,
  className 
}: WalletCardProps) => {
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-6 bg-gradient-hero text-white",
      className
    )}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-white/80">
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-medium">Wallet Balance</span>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-white/70 hover:text-white transition-colors"
          >
            {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-4xl font-display font-bold">
            {showBalance ? `${currency} ${formatCurrency(balance)}` : `${currency} ****`}
          </span>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="gold" 
            size="lg" 
            onClick={onFund}
            className="flex-1"
          >
            <Plus className="w-5 h-5" />
            Fund Wallet
          </Button>
        </div>
      </div>
    </div>
  );
};
