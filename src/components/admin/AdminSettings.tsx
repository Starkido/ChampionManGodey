import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { z } from "zod";
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Key,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Bell,
  Globe,
  Database,
  AlertTriangle,
  Settings,
  Lock,
  DollarSign,
} from "lucide-react";

interface AdminSettingsProps {
  user: User;
}

// Validation schemas
const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .regex(/^[0-9+]+$/, "Phone number can only contain digits and +"),
});

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const AdminSettings = ({ user }: AdminSettingsProps) => {
  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [newUserAlerts, setNewUserAlerts] = useState(true);
  const [withdrawalAlerts, setWithdrawalAlerts] = useState(true);

  // System preferences
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApproveWithdrawals, setAutoApproveWithdrawals] = useState(false);

  // Original profile values for change detection
  const [originalProfile, setOriginalProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // Fetch admin profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setPhone(data.phone || "");
          setOriginalProfile({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: data.phone || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("Failed to load profile");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user.id]);

  // Track unsaved changes
  useEffect(() => {
    const changed =
      firstName !== originalProfile.firstName ||
      lastName !== originalProfile.lastName ||
      phone !== originalProfile.phone;
    setHasUnsavedChanges(changed);
  }, [firstName, lastName, phone, originalProfile]);

  const validateProfile = () => {
    const result = profileSchema.safeParse({ firstName, lastName, phone });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setProfileErrors(errors);
      return false;
    }
    setProfileErrors({});
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setOriginalProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });
      setHasUnsavedChanges(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const validatePassword = () => {
    const result = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setPasswordErrors(errors);
      return false;
    }
    setPasswordErrors({});
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
      toast.success("Password changed successfully");
    } catch (err) {
      console.error("Error changing password:", err);
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Admin Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your admin account and system configuration
        </p>
      </div>

      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Account Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {firstName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-lg">
                {firstName} {lastName}
              </p>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  <Shield className="w-3 h-3" />
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary" />
            Profile Information
            {hasUnsavedChanges && (
              <span className="text-xs font-normal text-destructive ml-2">
                (unsaved changes)
              </span>
            )}
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminFirstName">First Name</Label>
              <Input
                id="adminFirstName"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (profileErrors.firstName) {
                    setProfileErrors((prev) => ({ ...prev, firstName: "" }));
                  }
                }}
                placeholder="Enter your first name"
                maxLength={50}
                className={profileErrors.firstName ? "border-destructive" : ""}
              />
              {profileErrors.firstName && (
                <p className="text-xs text-destructive">{profileErrors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminLastName">Last Name</Label>
              <Input
                id="adminLastName"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (profileErrors.lastName) {
                    setProfileErrors((prev) => ({ ...prev, lastName: "" }));
                  }
                }}
                placeholder="Enter your last name"
                maxLength={50}
                className={profileErrors.lastName ? "border-destructive" : ""}
              />
              {profileErrors.lastName && (
                <p className="text-xs text-destructive">{profileErrors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="adminEmail"
                value={user.email || ""}
                disabled
                className="pl-9 bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPhone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="adminPhone"
                value={phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9+]/g, "");
                  setPhone(cleaned);
                  if (profileErrors.phone) {
                    setProfileErrors((prev) => ({ ...prev, phone: "" }));
                  }
                }}
                placeholder="e.g., 0241234567"
                className={`pl-9 ${profileErrors.phone ? "border-destructive" : ""}`}
                maxLength={15}
              />
            </div>
            {profileErrors.phone && (
              <p className="text-xs text-destructive">{profileErrors.phone}</p>
            )}
          </div>

          <Button onClick={handleSaveProfile} disabled={isSaving || !hasUnsavedChanges}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminNewPassword">New Password</Label>
            <div className="relative">
              <Input
                id="adminNewPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordErrors.newPassword) {
                    setPasswordErrors((prev) => ({ ...prev, newPassword: "" }));
                  }
                }}
                placeholder="Enter new password"
                className={passwordErrors.newPassword ? "border-destructive pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-xs text-destructive">{passwordErrors.newPassword}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminConfirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="adminConfirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordErrors.confirmPassword) {
                    setPasswordErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }
                }}
                placeholder="Confirm new password"
                className={passwordErrors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-xs text-destructive">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !newPassword || !confirmPassword}
          >
            {isChangingPassword ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Key className="w-4 h-4" />
            )}
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Control which notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Transaction Alerts</Label>
              <p className="text-xs text-muted-foreground">
                Get notified on large or unusual transactions
              </p>
            </div>
            <Switch
              checked={transactionAlerts}
              onCheckedChange={setTransactionAlerts}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">New User Alerts</Label>
              <p className="text-xs text-muted-foreground">
                Notification when new users register
              </p>
            </div>
            <Switch
              checked={newUserAlerts}
              onCheckedChange={setNewUserAlerts}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Withdrawal Requests</Label>
              <p className="text-xs text-muted-foreground">
                Alert when users request withdrawals
              </p>
            </div>
            <Switch
              checked={withdrawalAlerts}
              onCheckedChange={setWithdrawalAlerts}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Platform-wide settings and controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Maintenance Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Temporarily disable the platform for all users
              </p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={(checked) => {
                setMaintenanceMode(checked);
                toast.info(
                  checked
                    ? "Maintenance mode enabled — users will see a notice"
                    : "Maintenance mode disabled — platform is live"
                );
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Auto-Approve Withdrawals
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically approve withdrawal requests under GHS 50
              </p>
            </div>
            <Switch
              checked={autoApproveWithdrawals}
              onCheckedChange={(checked) => {
                setAutoApproveWithdrawals(checked);
                toast.info(
                  checked
                    ? "Auto-approve enabled for small withdrawals"
                    : "All withdrawals now require manual approval"
                );
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Security Information
          </CardTitle>
          <CardDescription>
            Important security details for your admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Account Created</p>
                <p className="text-xs text-muted-foreground">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
              <Globe className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Last Sign In</p>
                <p className="text-xs text-muted-foreground">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </p>
              </div>
              <Database className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Auth Provider</p>
                <p className="text-xs text-muted-foreground">
                  {user.app_metadata?.provider || "email"}
                </p>
              </div>
              <Shield className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
