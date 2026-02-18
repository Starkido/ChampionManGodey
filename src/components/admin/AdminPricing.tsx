// import { useState } from "react";
// import { useAdminPricing } from "@/hooks/useAdminPricing";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
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
// import { NetworkBadge } from "@/components/NetworkBadge";
// import { TierBadge } from "@/components/TierBadge";
// import { Database } from "@/integrations/supabase/types";
// import { toast } from "sonner";
// import {
//   Plus,
//   RefreshCw,
//   Loader2,
//   Pencil,
//   Trash2,
//   Filter,
// } from "lucide-react";

// type AppRole = Database["public"]["Enums"]["app_role"];
// type Network = "MTN" | "Airtel" | "Telecel" | "MTN_AFA";

// const networks: Network[] = ["MTN", "Airtel", "Telecel", "MTN_AFA"];
// const roles: AppRole[] = [
//   "client",
//   "basic_agent",
//   "master_agent",
//   "premier_agent",
//   "elite_agent",
// ];

// interface TierForm {
//   network: Network;
//   package_name: string;
//   data_amount: string;
//   price: string;
//   role: AppRole;
//   is_active: boolean;
// }

// const emptyForm: TierForm = {
//   network: "MTN",
//   package_name: "",
//   data_amount: "",
//   price: "",
//   role: "client",
//   is_active: true,
// };

// export const AdminPricing = () => {
//   const { tiers, loading, error, refetch, createTier, updateTier, deleteTier } =
//     useAdminPricing();
//   const [networkFilter, setNetworkFilter] = useState<string>("all");
//   const [roleFilter, setRoleFilter] = useState<string>("all");
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState<TierForm>(emptyForm);
//   const [isSaving, setIsSaving] = useState(false);
//   const [deletingId, setDeletingId] = useState<string | null>(null);

//   const filteredTiers = tiers.filter((tier) => {
//     const matchesNetwork = networkFilter === "all" || tier.network === networkFilter;
//     const matchesRole = roleFilter === "all" || tier.role === roleFilter;
//     return matchesNetwork && matchesRole;
//   });

//   const openCreate = () => {
//     setForm(emptyForm);
//     setEditingId(null);
//     setIsDialogOpen(true);
//   };

//   const openEdit = (tier: typeof tiers[0]) => {
//     setForm({
//       network: tier.network as Network,
//       package_name: tier.package_name,
//       data_amount: tier.data_amount,
//       price: tier.price.toString(),
//       role: tier.role,
//       is_active: tier.is_active,
//     });
//     setEditingId(tier.id);
//     setIsDialogOpen(true);
//   };

//   const handleSave = async () => {
//     if (!form.package_name || !form.data_amount || !form.price) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     const price = parseFloat(form.price);
//     if (isNaN(price) || price <= 0) {
//       toast.error("Please enter a valid price");
//       return;
//     }

//     setIsSaving(true);

//     const tierData = {
//       network: form.network,
//       package_name: form.package_name,
//       data_amount: form.data_amount,
//       price,
//       role: form.role,
//       is_active: form.is_active,
//     };

//     let success: boolean;
//     if (editingId) {
//       success = await updateTier(editingId, tierData);
//     } else {
//       success = await createTier(tierData);
//     }

//     setIsSaving(false);

//     if (success) {
//       toast.success(editingId ? "Tier updated" : "Tier created");
//       setIsDialogOpen(false);
//       refetch();
//     } else {
//       toast.error("Failed to save tier");
//     }
//   };

//   const handleDelete = async (id: string) => {
//     setDeletingId(id);
//     const success = await deleteTier(id);
//     setDeletingId(null);

//     if (success) {
//       toast.success("Tier deleted");
//     } else {
//       toast.error("Failed to delete tier");
//     }
//   };

//   return (
//     <div className="p-6 lg:p-8 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
//             Pricing Tiers
//           </h1>
//           <p className="text-muted-foreground mt-1">
//             Manage data package pricing for each role
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={() => refetch()}>
//             <RefreshCw className="w-4 h-4" />
//           </Button>
//           <Button onClick={openCreate}>
//             <Plus className="w-4 h-4" />
//             Add Tier
//           </Button>
//         </div>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardContent className="p-4">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="flex items-center gap-2">
//               <Filter className="w-4 h-4 text-muted-foreground" />
//               <span className="text-sm text-muted-foreground">Filter:</span>
//             </div>
//             <Select value={networkFilter} onValueChange={setNetworkFilter}>
//               <SelectTrigger className="w-[150px]">
//                 <SelectValue placeholder="Network" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Networks</SelectItem>
//                 {networks.map((n) => (
//                   <SelectItem key={n} value={n}>{n}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select value={roleFilter} onValueChange={setRoleFilter}>
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Role" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Roles</SelectItem>
//                 {roles.map((r) => (
//                   <SelectItem key={r} value={r}>
//                     {r.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Pricing Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Pricing Tiers ({filteredTiers.length})</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <Loader2 className="w-8 h-8 animate-spin text-primary" />
//             </div>
//           ) : error ? (
//             <div className="text-center py-12 text-destructive">{error}</div>
//           ) : filteredTiers.length === 0 ? (
//             <div className="text-center py-12 text-muted-foreground">
//               No pricing tiers found
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Network</TableHead>
//                     <TableHead>Package</TableHead>
//                     <TableHead>Data</TableHead>
//                     <TableHead>Role</TableHead>
//                     <TableHead>Price</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredTiers.map((tier) => (
//                     <TableRow key={tier.id}>
//                       <TableCell>
//                         <NetworkBadge network={tier.network as Network} size="sm" />
//                       </TableCell>
//                       <TableCell className="font-medium">
//                         {tier.package_name}
//                       </TableCell>
//                       <TableCell>{tier.data_amount}</TableCell>
//                       <TableCell>
//                         <TierBadge tier={tier.role} size="sm" />
//                       </TableCell>
//                       <TableCell className="font-semibold">
//                         GHS {Number(tier.price).toFixed(2)}
//                       </TableCell>
//                       <TableCell>
//                         <span
//                           className={`text-xs px-2 py-1 rounded-full ${
//                             tier.is_active
//                               ? "bg-green-500/10 text-green-600"
//                               : "bg-muted text-muted-foreground"
//                           }`}
//                         >
//                           {tier.is_active ? "Active" : "Inactive"}
//                         </span>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end gap-1">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => openEdit(tier)}
//                           >
//                             <Pencil className="w-4 h-4" />
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleDelete(tier.id)}
//                             disabled={deletingId === tier.id}
//                           >
//                             {deletingId === tier.id ? (
//                               <Loader2 className="w-4 h-4 animate-spin" />
//                             ) : (
//                               <Trash2 className="w-4 h-4 text-destructive" />
//                             )}
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Create/Edit Dialog */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               {editingId ? "Edit Pricing Tier" : "Create Pricing Tier"}
//             </DialogTitle>
//             <DialogDescription>
//               Set the pricing for a specific network and role combination
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4 py-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label>Network</Label>
//                 <Select
//                   value={form.network}
//                   onValueChange={(v) => setForm({ ...form, network: v as Network })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {networks.map((n) => (
//                       <SelectItem key={n} value={n}>{n}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label>Role</Label>
//                 <Select
//                   value={form.role}
//                   onValueChange={(v) => setForm({ ...form, role: v as AppRole })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {roles.map((r) => (
//                       <SelectItem key={r} value={r}>
//                         {r.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label>Package Name</Label>
//               <Input
//                 value={form.package_name}
//                 onChange={(e) => setForm({ ...form, package_name: e.target.value })}
//                 placeholder="e.g., Daily Bundle"
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label>Data Amount</Label>
//                 <Input
//                   value={form.data_amount}
//                   onChange={(e) => setForm({ ...form, data_amount: e.target.value })}
//                   placeholder="e.g., 1GB"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>Price (GHS)</Label>
//                 <Input
//                   type="number"
//                   step="0.01"
//                   value={form.price}
//                   onChange={(e) => setForm({ ...form, price: e.target.value })}
//                   placeholder="0.00"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center justify-between">
//               <Label>Active</Label>
//               <Switch
//                 checked={form.is_active}
//                 onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleSave} disabled={isSaving}>
//               {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
//               {editingId ? "Update" : "Create"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };



import { useState } from "react";
import { useAdminPricing } from "@/hooks/useAdminPricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { NetworkBadge } from "@/components/NetworkBadge";
import { TierBadge } from "@/components/TierBadge";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import {
  Plus,
  RefreshCw,
  Loader2,
  Pencil,
  Trash2,
  Filter,
} from "lucide-react";

type AppRole = Database["public"]["Enums"]["app_role"];
type Network = "MTN" | "AT_iShare" | "AT_BigTime" | "Telecel" | "MTN_AFA";

const networks: { value: Network; label: string; description?: string }[] = [
  { value: "MTN", label: "MTN" },
  { value: "AT_iShare", label: "AT iShare", description: "60-day expiry" },
  { value: "AT_BigTime", label: "AT BigTime", description: "Non-expiry" },
  { value: "Telecel", label: "Telecel" },
  { value: "MTN_AFA", label: "MTN AFA" },
];

const roles: AppRole[] = [
  "client",
  "basic_agent",
  "master_agent",
  "premier_agent",
  "elite_agent",
];

interface TierForm {
  network: Network;
  package_name: string;
  data_amount: string;
  price: string;
  role: AppRole;
  is_active: boolean;
}

const emptyForm: TierForm = {
  network: "MTN",
  package_name: "",
  data_amount: "",
  price: "",
  role: "client",
  is_active: true,
};

const getNetworkLabel = (value: string): string => {
  const found = networks.find((n) => n.value === value);
  return found ? found.label : value;
};

export const AdminPricing = () => {
  const { tiers, loading, error, refetch, createTier, updateTier, deleteTier } =
    useAdminPricing();
  const [networkFilter, setNetworkFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TierForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredTiers = tiers.filter((tier) => {
    const matchesNetwork = networkFilter === "all" || tier.network === networkFilter;
    const matchesRole = roleFilter === "all" || tier.role === roleFilter;
    return matchesNetwork && matchesRole;
  });

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEdit = (tier: typeof tiers[0]) => {
    setForm({
      network: tier.network as Network,
      package_name: tier.package_name,
      data_amount: tier.data_amount,
      price: tier.price.toString(),
      role: tier.role,
      is_active: tier.is_active,
    });
    setEditingId(tier.id);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.package_name || !form.data_amount || !form.price) {
      toast.error("Please fill all required fields");
      return;
    }

    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSaving(true);

    const tierData = {
      network: form.network,
      package_name: form.package_name,
      data_amount: form.data_amount,
      price,
      role: form.role,
      is_active: form.is_active,
    };

    let success: boolean;
    if (editingId) {
      success = await updateTier(editingId, tierData);
    } else {
      success = await createTier(tierData);
    }

    setIsSaving(false);

    if (success) {
      toast.success(editingId ? "Tier updated" : "Tier created");
      setIsDialogOpen(false);
      refetch();
    } else {
      toast.error("Failed to save tier");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const success = await deleteTier(id);
    setDeletingId(null);

    if (success) {
      toast.success("Tier deleted");
    } else {
      toast.error("Failed to delete tier");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Pricing Tiers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage data package pricing for each role
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add Tier
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter:</span>
            </div>
            <Select value={networkFilter} onValueChange={setNetworkFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Networks</SelectItem>
                {networks.map((n) => (
                  <SelectItem key={n.value} value={n.value}>
                    {n.label}
                    {n.description && ` (${n.description})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Tiers ({filteredTiers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error}</div>
          ) : filteredTiers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No pricing tiers found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Network</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTiers.map((tier) => (
                    <TableRow key={tier.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <NetworkBadge network={tier.network as Network} size="sm" />
                          <span className="text-xs text-muted-foreground">{getNetworkLabel(tier.network)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{tier.package_name}</TableCell>
                      <TableCell>{tier.data_amount}</TableCell>
                      <TableCell>
                        <TierBadge tier={tier.role} size="sm" />
                      </TableCell>
                      <TableCell className="font-semibold">
                        GHS {Number(tier.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tier.is_active
                            ? "bg-green-500/10 text-green-600"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {tier.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(tier)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tier.id)}
                            disabled={deletingId === tier.id}
                          >
                            {deletingId === tier.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-destructive" />
                            )}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Pricing Tier" : "Create Pricing Tier"}
            </DialogTitle>
            <DialogDescription>
              Set the pricing for a specific network and role combination
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Network</Label>
                <Select
                  value={form.network}
                  onValueChange={(v) => setForm({ ...form, network: v as Network })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((n) => (
                      <SelectItem key={n.value} value={n.value}>
                        {n.label}
                        {n.description && ` — ${n.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Show description hint for selected network */}
                {networks.find(n => n.value === form.network)?.description && (
                  <p className="text-xs text-muted-foreground">
                    {networks.find(n => n.value === form.network)?.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v as AppRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Package Name</Label>
              <Input
                value={form.package_name}
                onChange={(e) => setForm({ ...form, package_name: e.target.value })}
                placeholder="e.g., Daily Bundle"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Amount</Label>
                <Input
                  value={form.data_amount}
                  onChange={(e) => setForm({ ...form, data_amount: e.target.value })}
                  placeholder="e.g., 1GB"
                />
              </div>

              <div className="space-y-2">
                <Label>Price (GHS)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
