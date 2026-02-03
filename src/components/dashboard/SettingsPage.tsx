import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TierBadge } from "@/components/TierBadge";
import { Database } from "@/integrations/supabase/types";
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
  Copy,
  Check,
} from "lucide-react";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  referral_code: string | null;
}

interface SettingsPageProps {
  user: User;
  profile: UserProfile | null;
  role: AppRole;
  onProfileUpdate: () => Promise<void>;
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

const passwordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const SettingsPage = ({
  user,
  profile,
  role,
  onProfileUpdate,
}: SettingsPageProps) => {
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const [copiedReferral, setCopiedReferral] = useState(false);

  // Sync state when profile prop changes
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setHasUnsavedChanges(false);
    }
  }, [profile]);

  // Track unsaved changes
  useEffect(() => {
    if (profile) {
      const changed =
        firstName !== (profile.first_name || "") ||
        lastName !== (profile.last_name || "") ||
        phone !== (profile.phone || "");
      setHasUnsavedChanges(changed);
    }
  }, [firstName, lastName, phone, profile]);

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
    if (!profile) return;
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

      await onProfileUpdate();
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

  const copyReferralCode = async () => {
    if (profile?.referral_code) {
      await navigator.clipboard.writeText(profile.referral_code);
      setCopiedReferral(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopiedReferral(false), 2000);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
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
                {firstName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-lg">
                {firstName} {lastName}
              </p>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2">
                <TierBadge tier={role} size="sm" />
              </div>
            </div>
          </div>

          {/* Referral Code */}
          {profile?.referral_code && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-sm text-muted-foreground">Your Referral Code</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="px-3 py-2 bg-muted rounded-md font-mono text-lg tracking-wider">
                  {profile.referral_code}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyReferralCode}
                  className="shrink-0"
                >
                  {copiedReferral ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Share this code with friends to earn 2% commission on their purchases
              </p>
            </div>
          )}
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
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
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
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
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
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                value={user.email || ""}
                disabled
                className="pl-9 bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => {
                  // Only allow digits and +
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
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
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
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
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
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
    </div>
  );
};
