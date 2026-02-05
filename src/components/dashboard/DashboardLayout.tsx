import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Logo } from "@/components/Logo";
import { TierBadge } from "@/components/TierBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Database } from "@/integrations/supabase/types";
import { HelpFAQDialog } from "./HelpFAQDialog";
import { TestModeBanner } from "@/components/TestModeBanner";
import {
  Home,
  Smartphone,
  Receipt,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

// WhatsApp support number - update this with your actual support number
const WHATSAPP_SUPPORT_NUMBER = "233594248172"; // Format: country code + number without +

interface DashboardLayoutProps {
  user: User;
  userRole: Database["public"]["Enums"]["app_role"];
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  onFundWallet?: () => void;
  children: React.ReactNode;
}

const navItems = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "buy-data", label: "Buy Data", icon: Smartphone },
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

const bottomNavItems = [
  { id: "wallet", label: "Fund Wallet", icon: Wallet },
  { id: "support", label: "WhatsApp Support", icon: MessageCircle },
  { id: "help", label: "Help & FAQ", icon: HelpCircle },
];

export const DashboardLayout = ({
  user,
  userRole,
  activeSection,
  onSectionChange,
  onLogout,
  onFundWallet,
  children,
}: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  const openWhatsAppSupport = () => {
    const message = encodeURIComponent("Hello, I need help with DataFlow.");
    window.open(`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${message}`, "_blank");
  };

  const userName = user.user_metadata?.first_name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <Logo variant="white" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sidebar-foreground truncate">
                {userName}
              </p>
              <TierBadge tier={userRole as any} size="sm" className="mt-1" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                activeSection === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-sidebar-border">
            {bottomNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "wallet") {
                    if (onFundWallet) {
                      onFundWallet();
                    } else {
                      onSectionChange("home");
                    }
                  } else if (item.id === "support") {
                    openWhatsAppSupport();
                  } else if (item.id === "help") {
                    setHelpDialogOpen(true);
                  }
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Test Mode Banner */}
        <TestModeBanner />
        
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-foreground mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-semibold text-foreground">
              {navItems.find((item) => item.id === activeSection)?.label || "Dashboard"}
            </h1>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <HelpFAQDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} />
    </div>
  );
};
