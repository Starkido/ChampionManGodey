// import { useState } from "react";
// import { useAdminUsers } from "@/hooks/useAdminUsers";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { TierBadge } from "@/components/TierBadge";
// import { Database } from "@/integrations/supabase/types";
// import { toast } from "sonner";
// import { format } from "date-fns";
// import {
//   Search,
//   RefreshCw,
//   Loader2,
//   UserCog,
//   Wallet,
//   Download,
//   Users,
//   CreditCard,
// } from "lucide-react";

// type AppRole = Database["public"]["Enums"]["app_role"];

// const roles: AppRole[] = [
//   "client",
//   "basic_agent",
//   "master_agent",
//   "premier_agent",
//   "elite_agent",
//   "admin",
// ];

// export const AdminUsers = () => {
//   const { users, loading, error, refetch, updateUserRole, bulkUpdateRoles, creditUserWallet } =
//     useAdminUsers();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState<string>("all");
  
//   // Single user role edit
//   const [editingUser, setEditingUser] = useState<{
//     userId: string;
//     currentRole: AppRole;
//     name: string;
//   } | null>(null);
//   const [newRole, setNewRole] = useState<AppRole>("client");
//   const [isUpdating, setIsUpdating] = useState(false);

//   // Bulk selection
//   const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
//   const [showBulkDialog, setShowBulkDialog] = useState(false);
//   const [bulkRole, setBulkRole] = useState<AppRole>("client");
//   const [isBulkUpdating, setIsBulkUpdating] = useState(false);

//   // Credit wallet
//   const [creditingUser, setCreditingUser] = useState<{
//     userId: string;
//     name: string;
//     currentBalance: number;
//   } | null>(null);
//   const [creditAmount, setCreditAmount] = useState("");
//   const [creditReason, setCreditReason] = useState("");
//   const [isCrediting, setIsCrediting] = useState(false);

//   const filteredUsers = users.filter((user) => {
//     const matchesSearch =
//       searchTerm === "" ||
//       user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.phone.includes(searchTerm);

//     const matchesRole = roleFilter === "all" || user.role === roleFilter;

//     return matchesSearch && matchesRole;
//   });

//   const handleSelectAll = (checked: boolean) => {
//     if (checked) {
//       setSelectedUsers(new Set(filteredUsers.map((u) => u.user_id)));
//     } else {
//       setSelectedUsers(new Set());
//     }
//   };

//   const handleSelectUser = (userId: string, checked: boolean) => {
//     const newSelected = new Set(selectedUsers);
//     if (checked) {
//       newSelected.add(userId);
//     } else {
//       newSelected.delete(userId);
//     }
//     setSelectedUsers(newSelected);
//   };

//   const handleRoleUpdate = async () => {
//     if (!editingUser) return;

//     setIsUpdating(true);
//     const success = await updateUserRole(editingUser.userId, newRole);
//     setIsUpdating(false);

//     if (success) {
//       toast.success(`Role updated to ${newRole.replace("_", " ")}`);
//       setEditingUser(null);
//     } else {
//       toast.error("Failed to update role");
//     }
//   };

//   const handleBulkRoleUpdate = async () => {
//     if (selectedUsers.size === 0) return;

//     setIsBulkUpdating(true);
//     const result = await bulkUpdateRoles(Array.from(selectedUsers), bulkRole);
//     setIsBulkUpdating(false);

//     if (result.success > 0) {
//       toast.success(`Updated ${result.success} user(s) to ${bulkRole.replace("_", " ")}`);
//     }
//     if (result.failed > 0) {
//       toast.error(`Failed to update ${result.failed} user(s)`);
//     }

//     setShowBulkDialog(false);
//     setSelectedUsers(new Set());
//   };

//   const handleCreditWallet = async () => {
//     if (!creditingUser) return;

//     const amount = parseFloat(creditAmount);
//     if (isNaN(amount) || amount <= 0) {
//       toast.error("Please enter a valid amount");
//       return;
//     }

//     if (!creditReason.trim()) {
//       toast.error("Please provide a reason");
//       return;
//     }

//     setIsCrediting(true);
//     const success = await creditUserWallet(creditingUser.userId, amount, creditReason.trim());
//     setIsCrediting(false);

//     if (success) {
//       toast.success(`Credited GHS ${amount.toFixed(2)} to ${creditingUser.name}`);
//       setCreditingUser(null);
//       setCreditAmount("");
//       setCreditReason("");
//     } else {
//       toast.error("Failed to credit wallet");
//     }
//   };

//   const exportToCSV = () => {
//     const headers = ["Name", "Email", "Phone", "Role", "Wallet Balance", "Referral Code", "Joined"];
//     const rows = filteredUsers.map((user) => [
//       `${user.first_name} ${user.last_name}`,
//       user.email,
//       user.phone,
//       user.role,
//       user.wallet_balance.toFixed(2),
//       user.referral_code || "",
//       format(new Date(user.created_at), "yyyy-MM-dd"),
//     ]);

//     const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `users-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//     toast.success("Users exported to CSV");
//   };

//   return (
//     <div className="p-6 lg:p-8 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
//             User Management
//           </h1>
//           <p className="text-muted-foreground mt-1">
//             Manage users, roles, and permissions
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={exportToCSV}>
//             <Download className="w-4 h-4" />
//             Export
//           </Button>
//           <Button variant="outline" onClick={() => refetch()}>
//             <RefreshCw className="w-4 h-4" />
//             Refresh
//           </Button>
//         </div>
//       </div>

//       {/* Bulk Actions */}
//       {selectedUsers.size > 0 && (
//         <Card className="border-primary/50 bg-primary/5">
//           <CardContent className="p-4">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//               <div className="flex items-center gap-2">
//                 <Users className="w-5 h-5 text-primary" />
//                 <span className="font-medium">{selectedUsers.size} user(s) selected</span>
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setSelectedUsers(new Set())}
//                 >
//                   Clear Selection
//                 </Button>
//                 <Button size="sm" onClick={() => setShowBulkDialog(true)}>
//                   <UserCog className="w-4 h-4" />
//                   Change Roles
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Filters */}
//       <Card>
//         <CardContent className="p-4">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search by name, email, or phone..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-9"
//               />
//             </div>
//             <Select value={roleFilter} onValueChange={setRoleFilter}>
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Filter by role" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Roles</SelectItem>
//                 {roles.map((role) => (
//                   <SelectItem key={role} value={role}>
//                     {role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Users Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Users ({filteredUsers.length})</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <Loader2 className="w-8 h-8 animate-spin text-primary" />
//             </div>
//           ) : error ? (
//             <div className="text-center py-12 text-destructive">{error}</div>
//           ) : filteredUsers.length === 0 ? (
//             <div className="text-center py-12 text-muted-foreground">
//               No users found
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="w-[50px]">
//                       <Checkbox
//                         checked={
//                           filteredUsers.length > 0 &&
//                           filteredUsers.every((u) => selectedUsers.has(u.user_id))
//                         }
//                         onCheckedChange={handleSelectAll}
//                       />
//                     </TableHead>
//                     <TableHead>User</TableHead>
//                     <TableHead>Contact</TableHead>
//                     <TableHead>Role</TableHead>
//                     <TableHead>Wallet</TableHead>
//                     <TableHead>Joined</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredUsers.map((user) => (
//                     <TableRow key={user.id}>
//                       <TableCell>
//                         <Checkbox
//                           checked={selectedUsers.has(user.user_id)}
//                           onCheckedChange={(checked) =>
//                             handleSelectUser(user.user_id, checked as boolean)
//                           }
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <div>
//                           <p className="font-medium">
//                             {user.first_name} {user.last_name}
//                           </p>
//                           <p className="text-sm text-muted-foreground">
//                             {user.email}
//                           </p>
//                         </div>
//                       </TableCell>
//                       <TableCell>{user.phone || "-"}</TableCell>
//                       <TableCell>
//                         <TierBadge tier={user.role} size="sm" />
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-1">
//                           <Wallet className="w-4 h-4 text-muted-foreground" />
//                           <span>GHS {user.wallet_balance.toFixed(2)}</span>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         {format(new Date(user.created_at), "MMM d, yyyy")}
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex justify-end gap-1">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => {
//                               setCreditingUser({
//                                 userId: user.user_id,
//                                 name: `${user.first_name} ${user.last_name}`,
//                                 currentBalance: user.wallet_balance,
//                               });
//                             }}
//                             title="Credit Wallet"
//                           >
//                             <CreditCard className="w-4 h-4" />
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => {
//                               setEditingUser({
//                                 userId: user.user_id,
//                                 currentRole: user.role,
//                                 name: `${user.first_name} ${user.last_name}`,
//                               });
//                               setNewRole(user.role);
//                             }}
//                             title="Change Role"
//                           >
//                             <UserCog className="w-4 h-4" />
//                           </Button>

//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={async () => {
//                               const amount = prompt("Enter amount to debit GHS");
//                               const reason = prompt("Reason for debit");
//                               if (!amount || !reason) return;

//                               const success = await debitUserWallet(
//                                 user.user_id,
//                                 parseFloat(amount),
//                                 reason
//                               );

//                               if (success) {
//                                 toast.success(`Debited GHS ${amount} from ${user.first_name}`);
//                                 refetch();
//                               } else {
//                                 toast.error("Failed to debit wallet");
//                               }
//                             }}
//                             title="Debit Wallet"
//                           >
//                             <CreditCard className="w-4 h-4 rotate-180" /> {/* rotated icon for debit */}
//                           </Button>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <Checkbox
//                           checked={user.is_blocked}
//                           onCheckedChange={async (checked) => {
//                             const success = await blockUser(user.user_id, checked as boolean);
//                             if (success) {
//                               toast.success(
//                                 `${user.first_name} ${user.last_name} has been ${
//                                   checked ? "blocked" : "unblocked"
//                                 }`
//                               );
//                             } else {
//                               toast.error("Failed to update block status");
//                             }
//                           }}
//                         />
//                       </TableCell>

//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Edit Role Dialog */}
//       <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Change User Role</DialogTitle>
//             <DialogDescription>
//               Update the role for {editingUser?.name}
//             </DialogDescription>
//           </DialogHeader>

//           <div className="py-4 space-y-4">
//             <div>
//               <p className="text-sm text-muted-foreground mb-2">Current Role</p>
//               <TierBadge tier={editingUser?.currentRole || "client"} />
//             </div>

//             <div>
//               <p className="text-sm text-muted-foreground mb-2">New Role</p>
//               <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {roles.map((role) => (
//                     <SelectItem key={role} value={role}>
//                       {role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setEditingUser(null)}>
//               Cancel
//             </Button>
//             <Button
//               onClick={handleRoleUpdate}
//               disabled={isUpdating || newRole === editingUser?.currentRole}
//             >
//               {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
//               Update Role
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Bulk Role Update Dialog */}
//       <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Bulk Role Change</DialogTitle>
//             <DialogDescription>
//               Change the role for {selectedUsers.size} selected user(s)
//             </DialogDescription>
//           </DialogHeader>

//           <div className="py-4 space-y-4">
//             <div>
//               <p className="text-sm text-muted-foreground mb-2">New Role for All Selected Users</p>
//               <Select value={bulkRole} onValueChange={(v) => setBulkRole(v as AppRole)}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {roles.map((role) => (
//                     <SelectItem key={role} value={role}>
//                       {role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleBulkRoleUpdate} disabled={isBulkUpdating}>
//               {isBulkUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
//               Update {selectedUsers.size} User(s)
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Credit Wallet Dialog */}
//       <Dialog open={!!creditingUser} onOpenChange={() => setCreditingUser(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Credit User Wallet</DialogTitle>
//             <DialogDescription>
//               Add funds to {creditingUser?.name}'s wallet
//             </DialogDescription>
//           </DialogHeader>

//           <div className="py-4 space-y-4">
//             <div>
//               <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
//               <p className="text-lg font-semibold">
//                 GHS {creditingUser?.currentBalance.toFixed(2)}
//               </p>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="creditAmount">Amount to Credit (GHS)</Label>
//               <Input
//                 id="creditAmount"
//                 type="number"
//                 min="0"
//                 step="0.01"
//                 value={creditAmount}
//                 onChange={(e) => setCreditAmount(e.target.value)}
//                 placeholder="Enter amount"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="creditReason">Reason</Label>
//               <Input
//                 id="creditReason"
//                 value={creditReason}
//                 onChange={(e) => setCreditReason(e.target.value)}
//                 placeholder="e.g., Bonus, Refund, Promo"
//                 maxLength={100}
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setCreditingUser(null)}>
//               Cancel
//             </Button>
//             <Button
//               onClick={handleCreditWallet}
//               disabled={isCrediting || !creditAmount || !creditReason.trim()}
//             >
//               {isCrediting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
//               Credit Wallet
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };



// import { useState } from "react";
// import { useAdminUsers } from "@/hooks/useAdminUsers";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { TierBadge } from "@/components/TierBadge";
// import { Database } from "@/integrations/supabase/types";
// import { toast } from "sonner";
// import { format } from "date-fns";
// import {
//   Search,
//   RefreshCw,
//   Loader2,
//   UserCog,
//   Wallet,
//   Download,
//   Users,
//   CreditCard,
//   Slash,
//   UserX,
// } from "lucide-react";

// type AppRole = Database["public"]["Enums"]["app_role"];

// const roles: AppRole[] = [
//   "client",
//   "basic_agent",
//   "master_agent",
//   "premier_agent",
//   "elite_agent",
//   "admin",
// ];

// export const AdminUsers = () => {
//   const {
//     users,
//     loading,
//     error,
//     refetch,
//     updateUserRole,
//     bulkUpdateRoles,
//     creditUserWallet,
//     blockUser,
//     debitUserWallet,
//     updateUserProfile,
//     clearUserCart,
//   } = useAdminUsers();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState<string>("all");

//   // Single user edit states
//   const [editingUser, setEditingUser] = useState<{
//     userId: string;
//     currentRole: AppRole;
//     name: string;
//     isBlocked: boolean;
//   } | null>(null);
//   const [newRole, setNewRole] = useState<AppRole>("client");
//   const [isUpdating, setIsUpdating] = useState(false);

//   // Bulk selection
//   const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
//   const [showBulkDialog, setShowBulkDialog] = useState(false);
//   const [bulkRole, setBulkRole] = useState<AppRole>("client");
//   const [isBulkUpdating, setIsBulkUpdating] = useState(false);

//   // Credit wallet
//   const [creditingUser, setCreditingUser] = useState<{
//     userId: string;
//     name: string;
//     currentBalance: number;
//   } | null>(null);
//   const [creditAmount, setCreditAmount] = useState("");
//   const [creditReason, setCreditReason] = useState("");
//   const [isCrediting, setIsCrediting] = useState(false);

//   // Update profile
// const [editingProfile, setEditingProfile] = useState<{
//   userId: string;
//   firstName: string;
//   lastName: string;
//   phone: string;
// } | null>(null);

// const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);


//   // Block/Unblock
//   const [blockingUser, setBlockingUser] = useState<{
//     userId: string;
//     name: string;
//     isBlocked: boolean;
//   } | null>(null);
//   const [isBlocking, setIsBlocking] = useState(false);

//   // Debit wallet
//   const [debitingUser, setDebitingUser] = useState<{
//     userId: string;
//     name: string;
//     currentBalance: number;
//   } | null>(null);
//   const [debitAmount, setDebitAmount] = useState("");
//   const [debitReason, setDebitReason] = useState("");
//   const [isDebiting, setIsDebiting] = useState(false);

//   const filteredUsers = users.filter((user) => {
//     const matchesSearch =
//       searchTerm === "" ||
//       user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.phone?.includes(searchTerm);

//     const matchesRole = roleFilter === "all" || user.role === roleFilter;

//     return matchesSearch && matchesRole;
//   });

//   // Selection handlers
//   const handleSelectAll = (checked: boolean) => {
//     setSelectedUsers(checked ? new Set(filteredUsers.map((u) => u.user_id)) : new Set());
//   };

//   const handleSelectUser = (userId: string, checked: boolean) => {
//     const newSelected = new Set(selectedUsers);
//     checked ? newSelected.add(userId) : newSelected.delete(userId);
//     setSelectedUsers(newSelected);
//   };

//   // Role updates
//   const handleRoleUpdate = async () => {
//     if (!editingUser) return;
//     setIsUpdating(true);
//     const success = await updateUserRole(editingUser.userId, newRole);
//     setIsUpdating(false);

//     if (success) {
//       toast.success(`Role updated to ${newRole.replace("_", " ")}`);
//       setEditingUser(null);
//     } else toast.error("Failed to update role");
//   };

//   const handleBulkRoleUpdate = async () => {
//     if (selectedUsers.size === 0) return;
//     setIsBulkUpdating(true);
//     const result = await bulkUpdateRoles(Array.from(selectedUsers), bulkRole);
//     setIsBulkUpdating(false);

//     if (result.success > 0) toast.success(`Updated ${result.success} user(s)`);
//     if (result.failed > 0) toast.error(`Failed to update ${result.failed} user(s)`);
//     setShowBulkDialog(false);
//     setSelectedUsers(new Set());
//   };

//   // Wallet actions
//   const handleCreditWallet = async () => {
//     if (!creditingUser) return;
//     const amount = parseFloat(creditAmount);
//     if (isNaN(amount) || amount <= 0) return toast.error("Invalid amount");
//     if (!creditReason.trim()) return toast.error("Provide reason");

//     setIsCrediting(true);
//     const success = await creditUserWallet(creditingUser.userId, amount, creditReason.trim());
//     setIsCrediting(false);

//     if (success) {
//       toast.success(`Credited GHS ${amount.toFixed(2)} to ${creditingUser.name}`);
//       setCreditAmount(""); setCreditReason(""); setCreditingUser(null);
//     } else toast.error("Failed to credit wallet");
//   };

//   const handleDebitWallet = async () => {
//     if (!debitingUser) return;
//     const amount = parseFloat(debitAmount);
//     if (isNaN(amount) || amount <= 0) return toast.error("Invalid amount");
//     if (!debitReason.trim()) return toast.error("Provide reason");

//     setIsDebiting(true);
//     const success = await debitUserWallet(debitingUser.userId, amount, debitReason.trim());
//     setIsDebiting(false);

//     if (success) {
//       toast.success(`Debited GHS ${amount.toFixed(2)} from ${debitingUser.name}`);
//       setDebitAmount(""); setDebitReason(""); setDebitingUser(null);
//     } else toast.error("Failed to debit wallet");
//   };

//   // Block/Unblock
//   const handleBlockUser = async () => {
//     if (!blockingUser) return;
//     setIsBlocking(true);
//     const success = await blockUser(blockingUser.userId, !blockingUser.isBlocked);
//     setIsBlocking(false);
//     if (success) {
//       toast.success(`${blockingUser.name} ${blockingUser.isBlocked ? "unblocked" : "blocked"}`);
//       setBlockingUser(null);
//     } else toast.error("Failed to update block status");
//   };

//   // Update profile
//   const handleUpdateProfile = async () => {
//     if (!updatingProfileUser) return;
//     setProfileLoading(true);
//     const success = await updateUserProfile(
//       updatingProfileUser.userId,
//       updatingProfileUser.firstName,
//       updatingProfileUser.lastName,
//       updatingProfileUser.phone
//     );
//     setProfileLoading(false);
//     if (success) {
//       toast.success("Profile updated");
//       setUpdatingProfileUser(null);
//     } else toast.error("Failed to update profile");
//   };

//   // Clear Cart
//   const handleClearCart = async (userId: string) => {
//     const success = await clearUserCart(userId);
//     success ? toast.success("Cart cleared") : toast.error("Failed to clear cart");
//   };

//   // Export
//   const exportToCSV = () => {
//     const headers = ["Name","Email","Phone","Role","Wallet Balance","Referral Code","Joined"];
//     const rows = filteredUsers.map((user) => [
//       `${user.first_name} ${user.last_name}`,
//       user.email,
//       user.phone,
//       user.role,
//       user.wallet_balance.toFixed(2),
//       user.referral_code || "",
//       format(new Date(user.created_at), "yyyy-MM-dd"),
//     ]);
//     const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a"); a.href = url;
//     a.download = `users-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
//     a.click(); URL.revokeObjectURL(url);
//     toast.success("Users exported to CSV");
//   };

//   // --------------------------
//   // TABLE UI
//   // --------------------------
//     return (
//     <div className="p-6 lg:p-8 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
//             User Management
//           </h1>
//           <p className="text-muted-foreground mt-1">
//             Manage users, roles, and permissions
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={exportToCSV}>
//             <Download className="w-4 h-4" />
//             Export
//           </Button>
//           <Button variant="outline" onClick={() => refetch()}>
//             <RefreshCw className="w-4 h-4" />
//             Refresh
//           </Button>
//         </div>
//       </div>

//       {/* Bulk Actions */}
//       {selectedUsers.size > 0 && (
//         <Card className="border-primary/50 bg-primary/5">
//           <CardContent className="p-4">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//               <div className="flex items-center gap-2">
//                 <Users className="w-5 h-5 text-primary" />
//                 <span className="font-medium">{selectedUsers.size} user(s) selected</span>
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setSelectedUsers(new Set())}
//                 >
//                   Clear Selection
//                 </Button>
//                 <Button size="sm" onClick={() => setShowBulkDialog(true)}>
//                   <UserCog className="w-4 h-4" />
//                   Change Roles
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Filters */}
//       <Card>
//         <CardContent className="p-4">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search by name, email, or phone..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-9"
//               />
//             </div>
//             <Select value={roleFilter} onValueChange={setRoleFilter}>
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Filter by role" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Roles</SelectItem>
//                 {roles.map((role) => (
//                   <SelectItem key={role} value={role}>
//                     {role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Users Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Users ({filteredUsers.length})</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <Loader2 className="w-8 h-8 animate-spin text-primary" />
//             </div>
//           ) : error ? (
//             <div className="text-center py-12 text-destructive">{error}</div>
//           ) : filteredUsers.length === 0 ? (
//             <div className="text-center py-12 text-muted-foreground">
//               No users found
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="w-[50px]">
//                       <Checkbox
//                         checked={
//                           filteredUsers.length > 0 &&
//                           filteredUsers.every((u) => selectedUsers.has(u.user_id))
//                         }
//                         onCheckedChange={handleSelectAll}
//                       />
//                     </TableHead>
//                     <TableHead>User</TableHead>
//                     <TableHead>Contact</TableHead>
//                     <TableHead>Role</TableHead>
//                     <TableHead>Wallet</TableHead>
//                     <TableHead>Joined</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredUsers.map((user) => (
//                     <TableRow key={user.id}>
//                       <TableCell>
//                         <Checkbox
//                           checked={selectedUsers.has(user.user_id)}
//                           onCheckedChange={(checked) =>
//                             handleSelectUser(user.user_id, checked as boolean)
//                           }
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <div>
//                           <p className="font-medium">
//                             {user.first_name} {user.last_name}
//                           </p>
//                           <p className="text-sm text-muted-foreground">
//                             {user.email}
//                           </p>
//                         </div>
//                       </TableCell>
//                       <TableCell>{user.phone || "-"}</TableCell>
//                       <TableCell>
//                         <TierBadge tier={user.role} size="sm" />
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-1">
//                           <Wallet className="w-4 h-4 text-muted-foreground" />
//                           <span>GHS {user.wallet_balance.toFixed(2)}</span>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         {format(new Date(user.created_at), "MMM d, yyyy")}
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex justify-end gap-1">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => {
//                               setCreditingUser({
//                                 userId: user.user_id,
//                                 name: `${user.first_name} ${user.last_name}`,
//                                 currentBalance: user.wallet_balance,
//                               });
//                             }}
//                             title="Credit Wallet"
//                           >
//                             <CreditCard className="w-4 h-4" />
//                           </Button>

//                           {/* Debit button */}
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={async () => {
//                               const amount = prompt("Enter amount to debit GHS");
//                               const reason = prompt("Reason for debit");
//                               if (!amount || !reason) return;

//                               const success = await debitUserWallet(
//                                 user.user_id,
//                                 parseFloat(amount),
//                                 reason
//                               );

//                               if (success) {
//                                 toast.success(`Debited GHS ${amount} from ${user.first_name}`);
//                                 refetch();
//                               } else {
//                                 toast.error("Failed to debit wallet");
//                               }
//                             }}
//                             title="Debit Wallet"
//                           >
//                             <CreditCard className="w-4 h-4 rotate-180" /> {/* rotated icon for debit */}
//                           </Button>

//                           {/* Block/Unblock */}
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() =>
//                               setBlockingUser({
//                                 userId: user.user_id,
//                                 name: `${user.first_name} ${user.last_name}`,
//                                 isBlocked: user.is_blocked,
//                               })
//                             }
//                             title={user.is_blocked ? "Unblock User" : "Block User"}
//                           >
//                             <UserX className="w-4 h-4" />
//                           </Button>


//                           {/* Update Profile */}
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => setEditingProfile(user)}
//                               title="Edit Profile"
//                             >
//                               <UserCog className="w-4 h-4" />
//                             </Button>
                            
                            
//                             <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
//                               <DialogContent>
//                                 <DialogHeader>
//                                   <DialogTitle>Edit User Profile</DialogTitle>
//                                   <DialogDescription>Update user info</DialogDescription>
//                                 </DialogHeader>

//                                 <div className="space-y-4 py-4">
//                                   <div>
//                                     <Label htmlFor="firstName">First Name</Label>
//                                     <Input
//                                       id="firstName"
//                                       value={editingProfile?.firstName || ""}
//                                       onChange={(e) =>
//                                         setEditingProfile((prev) =>
//                                           prev ? { ...prev, firstName: e.target.value } : null
//                                         )
//                                       }
//                                     />
//                                   </div>
//                                   <div>
//                                     <Label htmlFor="lastName">Last Name</Label>
//                                     <Input
//                                       id="lastName"
//                                       value={editingProfile?.lastName || ""}
//                                       onChange={(e) =>
//                                         setEditingProfile((prev) =>
//                                           prev ? { ...prev, lastName: e.target.value } : null
//                                         )
//                                       }
//                                     />
//                                   </div>
//                                   <div>
//                                     <Label htmlFor="phone">Phone</Label>
//                                     <Input
//                                       id="phone"
//                                       value={editingProfile?.phone || ""}
//                                       onChange={(e) =>
//                                         setEditingProfile((prev) =>
//                                           prev ? { ...prev, phone: e.target.value } : null
//                                         )
//                                       }
//                                     />
//                                   </div>
//                                 </div>

//                                 <DialogFooter>
//                                   <Button variant="outline" onClick={() => setEditingProfile(null)}>
//                                     Cancel
//                                   </Button>
//                                   <Button
//                                     onClick={async () => {
//                                       if (!editingProfile) return;
//                                       setIsUpdatingProfile(true);
//                                       const success = await updateUserProfile(
//                                         editingProfile.userId,
//                                         editingProfile.firstName,
//                                         editingProfile.lastName,
//                                         editingProfile.phone
//                                       );
//                                       setIsUpdatingProfile(false);
//                                       if (success) {
//                                         toast.success("Profile updated");
//                                         setEditingProfile(null);
//                                       } else {
//                                         toast.error("Failed to update profile");
//                                       }
//                                     }}
//                                     disabled={isUpdatingProfile}
//                                   >
//                                     {isUpdatingProfile ? (
//                                       <Loader2 className="w-4 h-4 animate-spin" />
//                                     ) : null}
//                                     Update
//                                   </Button>
//                                 </DialogFooter>
//                               </DialogContent>
//                             </Dialog>

//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={async () => {
//                                 if (!confirm(`Are you sure you want to clear ${user.first_name}'s cart?`))
//                                   return;

//                                 const success = await clearUserCart(user.user_id);
//                                 if (success) {
//                                   toast.success("Cart cleared successfully");
//                                 } else {
//                                   toast.error("Failed to clear cart");
//                                 }
//                               }}
//                             >
//                               🧹 {/* optional broom emoji */}
//                             </Button>

//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => {
//                               setEditingUser({
//                                 userId: user.user_id,
//                                 currentRole: user.role,
//                                 name: `${user.first_name} ${user.last_name}`,
//                               });
//                               setNewRole(user.role);
//                             }}
//                             title="Change Role"
//                           >
//                             <UserCog className="w-4 h-4" />
//                           </Button>

//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <Checkbox
//                           checked={user.is_blocked}
//                           onCheckedChange={async (checked) => {
//                             const success = await blockUser(user.user_id, checked as boolean);
//                             if (success) {
//                               toast.success(
//                                 `${user.first_name} ${user.last_name} has been ${
//                                   checked ? "blocked" : "unblocked"
//                                 }`
//                               );
//                             } else {
//                               toast.error("Failed to update block status");
//                             }
//                           }}
//                         />
//                       </TableCell>

//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Edit Role Dialog */}
//       <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Change User Role</DialogTitle>
//             <DialogDescription>
//               Update the role for {editingUser?.name}
//             </DialogDescription>
//           </DialogHeader>

//           <div className="py-4 space-y-4">
//             <div>
//               <p className="text-sm text-muted-foreground mb-2">Current Role</p>
//               <TierBadge tier={editingUser?.currentRole || "client"} />
//             </div>

//             <div>
//               <p className="text-sm text-muted-foreground mb-2">New Role</p>
//               <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {roles.map((role) => (
//                     <SelectItem key={role} value={role}>
//                       {role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setEditingUser(null)}>
//               Cancel
//             </Button>
//             <Button
//               onClick={handleRoleUpdate}
//               disabled={isUpdating || newRole === editingUser?.currentRole}
//             >
//               {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
//               Update Role
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Bulk Role Update Dialog */}
//       <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Bulk Role Change</DialogTitle>
//             <DialogDescription>
//               Change the role for {selectedUsers.size} selected user(s)
//             </DialogDescription>
//           </DialogHeader>

//           <div className="py-4 space-y-4">
//             <div>
//               <p className="text-sm text-muted-foreground mb-2">New Role for All Selected Users</p>
//               <Select value={bulkRole} onValueChange={(v) => setBulkRole(v as AppRole)}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {roles.map((role) => (
//                     <SelectItem key={role} value={role}>
//                       {role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleBulkRoleUpdate} disabled={isBulkUpdating}>
//               {isBulkUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
//               Update {selectedUsers.size} User(s)
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Credit Wallet Dialog */}
//       <Dialog open={!!creditingUser} onOpenChange={() => setCreditingUser(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Credit User Wallet</DialogTitle>
//             <DialogDescription>
//               Add funds to {creditingUser?.name}'s wallet
//             </DialogDescription>
//           </DialogHeader>

//           <div className="py-4 space-y-4">
//             <div>
//               <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
//               <p className="text-lg font-semibold">
//                 GHS {creditingUser?.currentBalance.toFixed(2)}
//               </p>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="creditAmount">Amount to Credit (GHS)</Label>
//               <Input
//                 id="creditAmount"
//                 type="number"
//                 min="0"
//                 step="0.01"
//                 value={creditAmount}
//                 onChange={(e) => setCreditAmount(e.target.value)}
//                 placeholder="Enter amount"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="creditReason">Reason</Label>
//               <Input
//                 id="creditReason"
//                 value={creditReason}
//                 onChange={(e) => setCreditReason(e.target.value)}
//                 placeholder="e.g., Bonus, Refund, Promo"
//                 maxLength={100}
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setCreditingUser(null)}>
//               Cancel
//             </Button>
//             <Button
//               onClick={handleCreditWallet}
//               disabled={isCrediting || !creditAmount || !creditReason.trim()}
//             >
//               {isCrediting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
//               Credit Wallet
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };



import { useState } from "react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TierBadge } from "@/components/TierBadge";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Search,
  RefreshCw,
  Loader2,
  UserCog,
  Wallet,
  Download,
  Users,
  CreditCard,
  UserX,
  Trash2,
} from "lucide-react";

type AppRole = Database["public"]["Enums"]["app_role"];

const roles: AppRole[] = [
  "client",
  "basic_agent",
  "master_agent",
  "premier_agent",
  "elite_agent",
  "admin",
];

export const AdminUsers = () => {
  const {
    users,
    loading,
    error,
    refetch,
    updateUserRole,
    bulkUpdateRoles,
    creditUserWallet,
    blockUser,
    debitUserWallet,
    updateUserProfile,
    clearUserCart,
  } = useAdminUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Single user edit states
  const [editingUser, setEditingUser] = useState<{
    userId: string;
    currentRole: AppRole;
    name: string;
    isBlocked: boolean;
  } | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("client");
  const [isUpdating, setIsUpdating] = useState(false);

  // Bulk selection
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkRole, setBulkRole] = useState<AppRole>("client");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Credit wallet
  const [creditingUser, setCreditingUser] = useState<{
    userId: string;
    name: string;
    currentBalance: number;
  } | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [isCrediting, setIsCrediting] = useState(false);

  // Update profile
  const [editingProfile, setEditingProfile] = useState<{
    userId: string;
    firstName: string;
    lastName: string;
    phone: string;
  } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Block/Unblock
  const [blockingUser, setBlockingUser] = useState<{
    userId: string;
    name: string;
    isBlocked: boolean;
  } | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);

  // Debit wallet
  const [debitingUser, setDebitingUser] = useState<{
    userId: string;
    name: string;
    currentBalance: number;
  } | null>(null);
  const [debitAmount, setDebitAmount] = useState("");
  const [debitReason, setDebitReason] = useState("");
  const [isDebiting, setIsDebiting] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectedUsers(checked ? new Set(filteredUsers.map((u) => u.user_id)) : new Set());
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    checked ? newSelected.add(userId) : newSelected.delete(userId);
    setSelectedUsers(newSelected);
  };

  // Role updates
  const handleRoleUpdate = async () => {
    if (!editingUser) return;
    setIsUpdating(true);
    const success = await updateUserRole(editingUser.userId, newRole);
    setIsUpdating(false);

    if (success) {
      toast.success(`Role updated to ${newRole.replace("_", " ")}`);
      setEditingUser(null);
    } else {
      toast.error("Failed to update role");
    }
  };

  const handleBulkRoleUpdate = async () => {
    if (selectedUsers.size === 0) return;
    setIsBulkUpdating(true);
    const result = await bulkUpdateRoles(Array.from(selectedUsers), bulkRole);
    setIsBulkUpdating(false);

    if (result.success > 0) {
      toast.success(`Updated ${result.success} user(s)`);
    }
    if (result.failed > 0) {
      toast.error(`Failed to update ${result.failed} user(s)`);
    }
    setShowBulkDialog(false);
    setSelectedUsers(new Set());
  };

  // Wallet actions
  const handleCreditWallet = async () => {
    if (!creditingUser) return;
    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      return toast.error("Invalid amount");
    }
    if (!creditReason.trim()) {
      return toast.error("Provide reason");
    }

    setIsCrediting(true);
    const success = await creditUserWallet(creditingUser.userId, amount, creditReason.trim());
    setIsCrediting(false);

    if (success) {
      toast.success(`Credited GHS ${amount.toFixed(2)} to ${creditingUser.name}`);
      setCreditAmount("");
      setCreditReason("");
      setCreditingUser(null);
    } else {
      toast.error("Failed to credit wallet");
    }
  };

  const handleDebitWallet = async () => {
    if (!debitingUser) return;
    const amount = parseFloat(debitAmount);
    if (isNaN(amount) || amount <= 0) {
      return toast.error("Invalid amount");
    }
    if (!debitReason.trim()) {
      return toast.error("Provide reason");
    }

    setIsDebiting(true);
    const success = await debitUserWallet(debitingUser.userId, amount, debitReason.trim());
    setIsDebiting(false);

    if (success) {
      toast.success(`Debited GHS ${amount.toFixed(2)} from ${debitingUser.name}`);
      setDebitAmount("");
      setDebitReason("");
      setDebitingUser(null);
    } else {
      toast.error("Failed to debit wallet");
    }
  };

  // Block/Unblock
  const handleBlockUser = async () => {
    if (!blockingUser) return;
    setIsBlocking(true);
    const success = await blockUser(blockingUser.userId, !blockingUser.isBlocked);
    setIsBlocking(false);
    if (success) {
      toast.success(`${blockingUser.name} ${blockingUser.isBlocked ? "unblocked" : "blocked"}`);
      setBlockingUser(null);
    } else {
      toast.error("Failed to update block status");
    }
  };

  // Update profile
  const handleUpdateProfile = async () => {
    if (!editingProfile) return;
    setIsUpdatingProfile(true);
    const success = await updateUserProfile(
      editingProfile.userId,
      editingProfile.firstName,
      editingProfile.lastName,
      editingProfile.phone
    );
    setIsUpdatingProfile(false);
    if (success) {
      toast.success("Profile updated");
      setEditingProfile(null);
    } else {
      toast.error("Failed to update profile");
    }
  };

  // Clear Cart
  const handleClearCart = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to clear ${userName}'s cart?`)) {
      return;
    }
    const success = await clearUserCart(userId);
    if (success) {
      toast.success("Cart cleared successfully");
    } else {
      toast.error("Failed to clear cart");
    }
  };

  // Export
  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Role", "Wallet Balance", "Referral Code", "Joined"];
    const rows = filteredUsers.map((user) => [
      `${user.first_name} ${user.last_name}`,
      user.email,
      user.phone || "",
      user.role,
      user.wallet_balance.toFixed(2),
      user.referral_code || "",
      format(new Date(user.created_at), "yyyy-MM-dd"),
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Users exported to CSV");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage users, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium">{selectedUsers.size} user(s) selected</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedUsers(new Set())}>
                  Clear Selection
                </Button>
                <Button size="sm" onClick={() => setShowBulkDialog(true)}>
                  <UserCog className="w-4 h-4 mr-2" />
                  Change Roles
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          filteredUsers.length > 0 &&
                          filteredUsers.every((u) => selectedUsers.has(u.user_id))
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.has(user.user_id)}
                          onCheckedChange={(checked) =>
                            handleSelectUser(user.user_id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>
                        <TierBadge tier={user.role} size="sm" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Wallet className="w-4 h-4 text-muted-foreground" />
                          <span>GHS {user.wallet_balance.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            user.is_blocked
                              ? "bg-destructive/10 text-destructive"
                              : "bg-green-500/10 text-green-600"
                          }`}
                        >
                          {user.is_blocked ? "Blocked" : "Active"}
                        </span>
                      </TableCell>
                      <TableCell>{format(new Date(user.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCreditingUser({
                                userId: user.user_id,
                                name: `${user.first_name} ${user.last_name}`,
                                currentBalance: user.wallet_balance,
                              });
                            }}
                            title="Credit Wallet"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDebitingUser({
                                userId: user.user_id,
                                name: `${user.first_name} ${user.last_name}`,
                                currentBalance: user.wallet_balance,
                              });
                            }}
                            title="Debit Wallet"
                          >
                            <CreditCard className="w-4 h-4 rotate-180" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setBlockingUser({
                                userId: user.user_id,
                                name: `${user.first_name} ${user.last_name}`,
                                isBlocked: user.is_blocked,
                              })
                            }
                            title={user.is_blocked ? "Unblock User" : "Block User"}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setEditingProfile({
                                userId: user.user_id,
                                firstName: user.first_name,
                                lastName: user.last_name,
                                phone: user.phone || "",
                              })
                            }
                            title="Edit Profile"
                          >
                            <UserCog className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleClearCart(
                                user.user_id,
                                `${user.first_name} ${user.last_name}`
                              )
                            }
                            title="Clear Cart"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser({
                                userId: user.user_id,
                                currentRole: user.role,
                                name: `${user.first_name} ${user.last_name}`,
                                isBlocked: user.is_blocked,
                              });
                              setNewRole(user.role);
                            }}
                            title="Change Role"
                          >
                            <UserCog className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>Update the role for {editingUser?.name}</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Role</p>
              <TierBadge tier={editingUser?.currentRole || "client"} />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">New Role</p>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRoleUpdate}
              disabled={isUpdating || newRole === editingUser?.currentRole}
            >
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Role Update Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Role Change</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUsers.size} selected user(s)
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">New Role for All Selected Users</p>
              <Select value={bulkRole} onValueChange={(v) => setBulkRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkRoleUpdate} disabled={isBulkUpdating}>
              {isBulkUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Update {selectedUsers.size} User(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credit Wallet Dialog */}
      <Dialog open={!!creditingUser} onOpenChange={() => setCreditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credit User Wallet</DialogTitle>
            <DialogDescription>Add funds to {creditingUser?.name}'s wallet</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
              <p className="text-lg font-semibold">
                GHS {creditingUser?.currentBalance.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditAmount">Amount to Credit (GHS)</Label>
              <Input
                id="creditAmount"
                type="number"
                min="0"
                step="0.01"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditReason">Reason</Label>
              <Input
                id="creditReason"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                placeholder="e.g., Bonus, Refund, Promo"
                maxLength={100}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditingUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreditWallet}
              disabled={isCrediting || !creditAmount || !creditReason.trim()}
            >
              {isCrediting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Credit Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Debit Wallet Dialog */}
      <Dialog open={!!debitingUser} onOpenChange={() => setDebitingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Debit User Wallet</DialogTitle>
            <DialogDescription>Deduct funds from {debitingUser?.name}'s wallet</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
              <p className="text-lg font-semibold">
                GHS {debitingUser?.currentBalance.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="debitAmount">Amount to Debit (GHS)</Label>
              <Input
                id="debitAmount"
                type="number"
                min="0"
                step="0.01"
                value={debitAmount}
                onChange={(e) => setDebitAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="debitReason">Reason</Label>
              <Input
                id="debitReason"
                value={debitReason}
                onChange={(e) => setDebitReason(e.target.value)}
                placeholder="e.g., Penalty, Adjustment, Correction"
                maxLength={100}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDebitingUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDebitWallet}
              disabled={isDebiting || !debitAmount || !debitReason.trim()}
            >
              {isDebiting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Debit Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block/Unblock User Dialog */}
      <Dialog open={!!blockingUser} onOpenChange={() => setBlockingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{blockingUser?.isBlocked ? "Unblock" : "Block"} User</DialogTitle>
            <DialogDescription>
              Are you sure you want to {blockingUser?.isBlocked ? "unblock" : "block"}{" "}
              {blockingUser?.name}?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockingUser(null)}>
              Cancel
            </Button>
            <Button
              variant={blockingUser?.isBlocked ? "default" : "destructive"}
              onClick={handleBlockUser}
              disabled={isBlocking}
            >
              {isBlocking && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {blockingUser?.isBlocked ? "Unblock" : "Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={editingProfile?.firstName || ""}
                onChange={(e) =>
                  setEditingProfile((prev) =>
                    prev ? { ...prev, firstName: e.target.value } : null
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={editingProfile?.lastName || ""}
                onChange={(e) =>
                  setEditingProfile((prev) =>
                    prev ? { ...prev, lastName: e.target.value } : null
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editingProfile?.phone || ""}
                onChange={(e) =>
                  setEditingProfile((prev) => (prev ? { ...prev, phone: e.target.value } : null))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProfile(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
              {isUpdatingProfile && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
