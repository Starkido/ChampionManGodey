import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "white" | "dark";
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className, variant = "default", size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const colorClasses = {
    default: "text-primary",
    white: "text-white",
    dark: "text-foreground",
  };

  return (
    <div className={cn("font-display font-bold tracking-tight flex items-center gap-2", sizeClasses[size], className)}>
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center",
        size === "lg" && "w-12 h-12 rounded-xl",
        size === "sm" && "w-6 h-6 rounded-md",
        variant === "white" ? "bg-white/20" : "bg-gradient-primary"
      )}>
        <span className={cn(
          "font-display font-bold",
          variant === "white" ? "text-white" : "text-primary-foreground",
          size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg"
        )}>
          G
        </span>
      </div>
      <span className={cn(colorClasses[variant])}>
        Champion Man Agency
      </span>
    </div>
  );
};
