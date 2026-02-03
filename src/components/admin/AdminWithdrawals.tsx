import { useState } from "react";
import { useAdminWithdrawals } from "@/hooks/useWithdrawals";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowDownCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const AdminWithdrawals = () => {
  const { withdrawals, isLoading, refetch } = useAdminWithdrawals();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [adminNote, setAdminNote] = useState("");

  const pendingCount = withdrawals.filter((w) => w.status === "pending").length;
  const completedCount = withdrawals.filter((w) => w.status === "completed").length;
  const totalPending = withdrawals
    .filter((w) => w.status === "pending")
    .reduce((sum, w) => sum + Number(w.amount), 0);

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesSearch =
      w.phone_number.includes(searchTerm) ||
      w.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.network.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openActionDialog = (withdrawal: any, action: "approve" | "reject") => {
    setSelectedWithdrawal(withdrawal);
    setActionType(action);
    setAdminNote("");
    setActionDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedWithdrawal) return;

    setProcessingId(selectedWithdrawal.id);

    try {
      const newStatus = actionType === "approve" ? "completed" : "rejected";

      // Update withdrawal status
      const { error: withdrawalError } = await supabase
        .from("withdrawals")
        .update({
          status: newStatus,
          admin_note: adminNote || null,
          processed_at: new Date().toISOString(),
        })
        .eq("id", selectedWithdrawal.id);

      if (withdrawalError) throw withdrawalError;

      // Update transaction status
      await supabase
        .from("transactions")
        .update({ status: newStatus })
        .eq("reference", selectedWithdrawal.reference);

      // If rejected, refund the wallet
      if (actionType === "reject") {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", selectedWithdrawal.user_id)
          .single();

        if (wallet) {
          await supabase
            .from("wallets")
            .update({ balance: wallet.balance + Number(selectedWithdrawal.amount) })
            .eq("user_id", selectedWithdrawal.user_id);
        }
      }

      toast.success(
        actionType === "approve"
          ? "Withdrawal approved successfully"
          : "Withdrawal rejected and refunded"
      );

      setActionDialogOpen(false);
      refetch();
    } catch (err: any) {
      console.error("Action error:", err);
      toast.error(err.message || "Failed to process withdrawal");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Withdrawal Requests
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage user withdrawal requests to mobile money
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {pendingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ArrowDownCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  GHS {totalPending.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {completedCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone, reference, or network..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12">
              <ArrowDownCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No withdrawal requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        {format(new Date(withdrawal.created_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {withdrawal.reference || "-"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        GHS {Number(withdrawal.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{withdrawal.network}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {withdrawal.phone_number}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            withdrawal.status === "completed"
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : withdrawal.status === "rejected"
                              ? "bg-red-500/10 text-red-600 border-red-500/20"
                              : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                          )}
                        >
                          {withdrawal.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {withdrawal.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:bg-green-50"
                              onClick={() => openActionDialog(withdrawal, "approve")}
                              disabled={processingId === withdrawal.id}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => openActionDialog(withdrawal, "reject")}
                              disabled={processingId === withdrawal.id}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {withdrawal.status !== "pending" && (
                          <span className="text-sm text-muted-foreground">
                            {withdrawal.processed_at
                              ? format(new Date(withdrawal.processed_at), "MMM d, HH:mm")
                              : "-"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Withdrawal" : "Reject Withdrawal"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Confirm that you have sent the mobile money transfer."
                : "This will refund the amount back to the user's wallet."}
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">
                    GHS {Number(selectedWithdrawal.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span>{selectedWithdrawal.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-mono">{selectedWithdrawal.phone_number}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNote">Admin Note (optional)</Label>
                <Textarea
                  id="adminNote"
                  placeholder="Add a note about this action..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={!!processingId}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={!!processingId}
              variant={actionType === "approve" ? "default" : "destructive"}
            >
              {processingId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : actionType === "approve" ? (
                "Approve & Mark Sent"
              ) : (
                "Reject & Refund"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
