// import { cn } from "@/lib/utils";

// type NetworkType = "MTN" | "Airtel" | "Telecel" | "MTN_AFA" | "AT_iShare" | "AT_BigTime";
// // type NetworkType =
// //   | "MTN"
// //   // | "Airtel"
// //   | "Telecel"
// //   | "MTN_AFA"
// //   | "AT_iShare"
// //   | "AT_BigTime";

// interface NetworkBadgeProps {
//   network: NetworkType;
//   size?: "sm" | "md" | "lg";
//   className?: string;
// }

// const networkStyles: Record<NetworkType, string> = {
//   MTN: "bg-network-mtn text-black",
//   Telecel: "bg-network-telecel text-white",
//   MTN_AFA: "bg-network-afa text-black",
//   AT_iShare: "bg-network-at-ishare text-white",   // new
//   AT_BigTime: "bg-network-at-bigtime text-white", // new
// };

// const networkLabels: Record<NetworkType, string> = {
//   MTN: "MTN",
//   Telecel: "Telecel",
//   MTN_AFA: "MTN AFA",
//   AT_iShare: "AT iShare",
//   AT_BigTime: "AT BigTime",
// };

// export const NetworkBadge = ({ network, size = "md", className }: NetworkBadgeProps) => {
//   const sizeClasses = {
//     sm: "px-2 py-0.5 text-xs",
//     md: "px-3 py-1 text-sm",
//     lg: "px-4 py-1.5 text-base",
//   };

//   return (
//     <span
//       className={cn(
//         "inline-flex items-center font-semibold rounded-full",
//         networkStyles[network],
//         sizeClasses[size],
//         className
//       )}
//     >
//       {networkLabels[network]}
//     </span>
//   );
// };


// import { cn } from "@/lib/utils";

// type Network = "MTN" | "AT_iShare" | "AT_BigTime" | "Telecel" | "MTN_AFA";

// interface NetworkBadgeProps {
//   network: Network | string;
//   size?: "sm" | "md" | "lg";
//   className?: string;
// }

// const networkConfig: Record<string, {
//   label: string;
//   shortLabel: string;
//   bg: string;
//   text: string;
//   border: string;
//   dot: string;
// }> = {
//   MTN: {
//     label: "MTN",
//     shortLabel: "MTN",
//     bg: "bg-yellow-50",
//     text: "text-yellow-800",
//     border: "border-yellow-300",
//     dot: "bg-yellow-400",
//   },
//   AT_iShare: {
//     label: "AT iShare",
//     shortLabel: "iShare",
//     bg: "bg-red-50",
//     text: "text-red-800",
//     border: "border-red-300",
//     dot: "bg-red-500",
//   },
//   AT_BigTime: {
//     label: "AT BigTime",
//     shortLabel: "BigTime",
//     bg: "bg-orange-50",
//     text: "text-orange-800",
//     border: "border-orange-300",
//     dot: "bg-orange-500",
//   },
//   Telecel: {
//     label: "Telecel",
//     shortLabel: "Telecel",
//     bg: "bg-blue-50",
//     text: "text-blue-800",
//     border: "border-blue-300",
//     dot: "bg-blue-500",
//   },
//   MTN_AFA: {
//     label: "MTN AFA",
//     shortLabel: "AFA",
//     bg: "bg-amber-50",
//     text: "text-amber-800",
//     border: "border-amber-300",
//     dot: "bg-amber-400",
//   },
// };

// // Fallback config for unknown networks
// const fallbackConfig = {
//   label: "Unknown",
//   shortLabel: "N/A",
//   bg: "bg-gray-50",
//   text: "text-gray-700",
//   border: "border-gray-300",
//   dot: "bg-gray-400",
// };

// const sizeClasses = {
//   sm: {
//     badge: "px-2 py-0.5 text-xs gap-1",
//     dot: "w-1.5 h-1.5",
//   },
//   md: {
//     badge: "px-2.5 py-1 text-sm gap-1.5",
//     dot: "w-2 h-2",
//   },
//   lg: {
//     badge: "px-3 py-1.5 text-sm gap-2",
//     dot: "w-2.5 h-2.5",
//   },
// };

// export const NetworkBadge = ({
//   network,
//   size = "md",
//   className,
// }: NetworkBadgeProps) => {
//   const config = networkConfig[network] || { ...fallbackConfig, label: network, shortLabel: network };
//   const sizes = sizeClasses[size];
//   const label = size === "sm" ? config.shortLabel : config.label;

//   return (
//     <span
//       className={cn(
//         "inline-flex items-center rounded-full border font-medium",
//         config.bg,
//         config.text,
//         config.border,
//         sizes.badge,
//         className
//       )}
//     >
//       <span className={cn("rounded-full flex-shrink-0", config.dot, sizes.dot)} />
//       {label}
//     </span>
//   );
// };


import { cn } from "@/lib/utils";

type Network = "MTN" | "AT_iShare" | "AT_BigTime" | "Telecel" | "MTN_AFA";

interface NetworkBadgeProps {
  network: Network | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const networkConfig: Record<string, {
  label: string;
  shortLabel: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}> = {
  MTN: {
    label: "MTN",
    shortLabel: "MTN",
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-300",
    dot: "bg-yellow-400",
  },
  AT_iShare: {
    label: "AT iShare",
    shortLabel: "iShare",
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-300",
    dot: "bg-red-500",
  },
  AT_BigTime: {
    label: "AT BigTime",
    shortLabel: "BigTime",
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-300",
    dot: "bg-orange-500",
  },
  Telecel: {
    label: "Telecel",
    shortLabel: "Telecel",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-300",
    dot: "bg-blue-500",
  },
  MTN_AFA: {
    label: "MTN AFA",
    shortLabel: "AFA",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    dot: "bg-amber-400",
  },
};

// Fallback for unknown networks
const fallbackConfig = {
  label: "Unknown",
  shortLabel: "N/A",
  bg: "bg-gray-50",
  text: "text-gray-700",
  border: "border-gray-300",
  dot: "bg-gray-400",
};

const sizeClasses = {
  sm: {
    badge: "px-2 py-0.5 text-xs gap-1",
    dot: "w-1.5 h-1.5",
  },
  md: {
    badge: "px-2.5 py-1 text-sm gap-1.5",
    dot: "w-2 h-2",
  },
  lg: {
    badge: "px-3 py-1.5 text-sm gap-2",
    dot: "w-2.5 h-2.5",
  },
};

export const NetworkBadge = ({
  network,
  size = "md",
  className,
}: NetworkBadgeProps) => {
  const config = networkConfig[network] || { ...fallbackConfig, label: network, shortLabel: network };
  const sizes = sizeClasses[size];
  const label = size === "sm" ? config.shortLabel : config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.bg,
        config.text,
        config.border,
        sizes.badge,
        className
      )}
    >
      <span className={cn("rounded-full flex-shrink-0", config.dot, sizes.dot)} />
      {label}
    </span>
  );
};
