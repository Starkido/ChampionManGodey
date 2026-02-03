import { cn } from "@/lib/utils";
import { Shield, Star, Crown, Gem, Sparkles } from "lucide-react";

type TierType = "client" | "basic_agent" | "master_agent" | "premier_agent" | "elite_agent" | "admin";

interface TierBadgeProps {
  tier: TierType;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const tierConfig: Record<TierType, { label: string; style: string; icon: React.ElementType }> = {
  client: {
    label: "Client",
    style: "bg-muted text-muted-foreground border border-border",
    icon: Shield,
  },
  basic_agent: {
    label: "Basic Agent",
    style: "bg-primary/10 text-primary border border-primary/30",
    icon: Star,
  },
  master_agent: {
    label: "Master Agent",
    style: "bg-info/10 text-info border border-info/30",
    icon: Crown,
  },
  premier_agent: {
    label: "Premier Agent",
    style: "bg-[hsl(263,70%,58%)]/10 text-[hsl(263,70%,58%)] border border-[hsl(263,70%,58%)]/30",
    icon: Gem,
  },
  elite_agent: {
    label: "Elite Agent",
    style: "bg-accent/10 text-accent border border-accent/30",
    icon: Sparkles,
  },
  admin: {
    label: "Admin",
    style: "bg-destructive/10 text-destructive border border-destructive/30",
    icon: Shield,
  },
};

export const TierBadge = ({ tier, size = "md", showIcon = true, className }: TierBadgeProps) => {
  const config = tierConfig[tier];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        config.style,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {config.label}
    </span>
  );
};
