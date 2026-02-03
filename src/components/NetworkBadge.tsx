import { cn } from "@/lib/utils";

type NetworkType = "MTN" | "Airtel" | "Telecel" | "MTN_AFA";

interface NetworkBadgeProps {
  network: NetworkType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const networkStyles: Record<NetworkType, string> = {
  MTN: "bg-network-mtn text-black",
  Airtel: "bg-network-airtel text-white",
  Telecel: "bg-network-telecel text-white",
  MTN_AFA: "bg-network-afa text-black",
};

const networkLabels: Record<NetworkType, string> = {
  MTN: "MTN",
  Airtel: "Airtel",
  Telecel: "Telecel",
  MTN_AFA: "MTN AFA",
};

export const NetworkBadge = ({ network, size = "md", className }: NetworkBadgeProps) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full",
        networkStyles[network],
        sizeClasses[size],
        className
      )}
    >
      {networkLabels[network]}
    </span>
  );
};
