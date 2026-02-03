import { useState } from "react";
import { useAdminTransactions } from "@/hooks/useAdminTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import {
  Search,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  Receipt,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const typeLabels: Record<string, string> = {
  wallet_funding: "Wallet Funding",
  purchase: "Data Purchase",
  commission: "Commission",
  admin_credit: "Admin Credit",
};

const statusColors: Record<string, string> = {
  pending: "bg-secondary/50 text-secondary-foreground border-secondary",
  success: "bg-primary/10 text-primary border-primary/20",
  partial: "bg-accent/10 text-accent border-accent/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

export const AdminTransactions = () => {
  const { transactions, loading, error, stats, refetch } = useAdminTransactions();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      searchTerm === "" ||
      tx.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.user_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ["Date", "User", "Email", "Type", "Reference", "Amount", "Status"];
    const rows = filteredTransactions.map((tx) => [
      format(new Date(tx.created_at), "yyyy-MM-dd HH:mm"),
      tx.user_name || "Unknown",
      tx.user_email || "",
      typeLabels[tx.type] || tx.type,
      tx.reference || "",
      tx.amount.toFixed(2),
      tx.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transactions exported to CSV");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            All Transactions
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all platform transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>


      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Funding</p>
                <p className="font-semibold">GHS {stats.totalFunding.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Total Purchases</p>
                <p className="font-semibold">GHS {stats.totalPurchases.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Commissions</p>
                <p className="font-semibold">GHS {stats.totalCommissions.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="text-xs font-bold text-destructive">!</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="font-semibold">{stats.pendingCount}</p>
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
                placeholder="Search by reference, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="wallet_funding">Funding</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="commission">Commissions</SelectItem>
                <SelectItem value="admin_credit">Admin Credits</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error}</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(tx.created_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{tx.user_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.user_email || tx.user_id.slice(0, 8)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {tx.type === "wallet_funding" || tx.type === "admin_credit" ? (
                            <TrendingUp className="w-4 h-4 text-primary" />
                          ) : tx.type === "purchase" ? (
                            <TrendingDown className="w-4 h-4 text-accent" />
                          ) : (
                            <Receipt className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">
                            {typeLabels[tx.type] || tx.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {tx.reference || "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "font-semibold",
                            tx.type === "wallet_funding" || tx.type === "commission" || tx.type === "admin_credit"
                              ? "text-primary"
                              : "text-foreground"
                          )}
                        >
                          {tx.type === "wallet_funding" || tx.type === "commission" || tx.type === "admin_credit"
                            ? "+"
                            : "-"}
                          GHS {tx.amount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("capitalize", statusColors[tx.status])}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
