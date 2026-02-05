import { AlertTriangle } from "lucide-react";

// This flag controls whether test mode banner is shown
// Set to false when using live Paystack and Agyengosoln API keys
const IS_TEST_MODE = true;

interface TestModeBannerProps {
  className?: string;
}

export const TestModeBanner = ({ className }: TestModeBannerProps) => {
  if (!IS_TEST_MODE) return null;

  return (
    <div className={`bg-warning text-warning-foreground px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 ${className || ""}`}>
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>
        <strong>TEST MODE:</strong>
        Contact admin for wallet balance credition or use the manual funding feature.
      </span>
    </div>
  );
};
