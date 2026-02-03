import { useState, useEffect } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ManualFundingRequest {
  id: string;
  user_id: string;
  amount: number;
  network: string;
  transaction_id: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  processed_at: string | null;
  user_email?: string;
  user_name?: string;
}

export const AdminManualFunding = () => {
  const [requests, setRequests] = useState<ManualFundingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; request: ManualFundingRequest | null }>({
    open: false,
    request: null,
  });
  const [rejectReason, setRejectReason] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetch requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("manual_funding_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch user profiles for each request
      const userIds = [...new Set(requestsData?.map((r) => r.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email, first_name, last_name")
        .in("user_id", userIds);

      // Map profiles to requests
      const enrichedRequests = requestsData?.map((request) => {
        const profile = profiles?.find((p) => p.user_id === request.user_id);
        return {
          ...request,
          user_email: profile?.email || "Unknown",
          user_name: profile ? `${profile.first_name} ${profile.last_name}` : "Unknown",
        };
      });

      setRequests(enrichedRequests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch funding requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request: ManualFundingRequest) => {
    setProcessingId(request.id);
    try {
      // Get current wallet balance
      const { data: wallet, error: walletFetchError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", request.user_id)
        .single();

      if (walletFetchError) throw walletFetchError;

      const newBalance = (Number(wallet.balance) || 0) + request.amount;

      // Update wallet
      const { error: walletUpdateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", request.user_id);

      if (walletUpdateError) throw walletUpdateError;

      // Update request status
      const { error: requestUpdateError } = await supabase
        .from("manual_funding_requests")
        .update({
          status: "approved",
          processed_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (requestUpdateError) throw requestUpdateError;

      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: request.user_id,
        type: "manual_funding",
        amount: request.amount,
        status: "success",
        reference: `MF-${request.transaction_id}`,
        metadata: {
          network: request.network,
          original_transaction_id: request.transaction_id,
        },
      });

      // Send SMS notification
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("user_id", request.user_id)
        .single();

      if (profile?.phone) {
        await supabase.functions.invoke("send-sms", {
          body: {
            to: profile.phone,
            message: `Your manual funding request for GHS ${request.amount.toFixed(2)} has been approved. Your wallet has been credited.`,
          },
        });
      }

      toast.success("Funding request approved and wallet credited");
      fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.request) return;

    setProcessingId(rejectDialog.request.id);
    try {
      const { error } = await supabase
        .from("manual_funding_requests")
        .update({
          status: "rejected",
          admin_note: rejectReason,
          processed_at: new Date().toISOString(),
        })
        .eq("id", rejectDialog.request.id);

      if (error) throw error;

      // Send SMS notification
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("user_id", rejectDialog.request.user_id)
        .single();

      if (profile?.phone) {
        await supabase.functions.invoke("send-sms", {
          body: {
            to: profile.phone,
            message: `Your manual funding request for GHS ${rejectDialog.request.amount.toFixed(2)} was rejected. Reason: ${rejectReason || "Not specified"}.`,
          },
        });
      }

      toast.success("Funding request rejected");
      setRejectDialog({ open: false, request: null });
      setRejectReason("");
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRequests = requests.filter(
    (request) =>
      request.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.network.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manual Funding Requests</h2>
          <p className="text-muted-foreground">
            Review and process manual wallet funding requests
          </p>
        </div>
        <Button variant="outline" onClick={fetchRequests} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {requests.filter((r) => r.status === "approved").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {requests.filter((r) => r.status === "rejected").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by email, name, transaction ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Wallet className="w-12 h-12 mb-4 opacity-50" />
              <p>No funding requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.user_name}</p>
                        <p className="text-xs text-muted-foreground">{request.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      GHS {request.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{request.network}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {request.transaction_id}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(request.created_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      {request.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request)}
                            disabled={processingId === request.id}
                          >
                            {processingId === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectDialog({ open: true, request })}
                            disabled={processingId === request.id}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {request.admin_note && (
                            <span title={request.admin_note}>Note: {request.admin_note.substring(0, 20)}...</span>
                          )}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, request: rejectDialog.request })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Funding Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this funding request. The user will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Rejection</Label>
              <Textarea
                placeholder="e.g., Transaction ID not found, Amount mismatch..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, request: null })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || processingId === rejectDialog.request?.id}
            >
              {processingId === rejectDialog.request?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
