import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAdminTransactions } from "@/hooks/useAdminTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Wallet,
  TrendingUp,
  Receipt,
  Clock,
  UserCheck,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export const AdminOverview = () => {
  const { users, loading: usersLoading } = useAdminUsers();
  const { stats, dailyStats, loading: txLoading } = useAdminTransactions();

  const loading = usersLoading || txLoading;

  // Calculate user stats
  const totalUsers = users.length;
  const agentCount = users.filter((u) => u.role !== "client" && u.role !== "admin").length;
  const totalWalletBalance = users.reduce((sum, u) => sum + u.wallet_balance, 0);

  // Calculate today's stats
  const todayStats = dailyStats.length > 0 ? dailyStats[dailyStats.length - 1] : null;

  if (loading) {
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
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          System overview and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="font-display text-2xl font-bold">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <p className="font-display text-2xl font-bold">{agentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Wallet Balance</p>
                <p className="font-display text-2xl font-bold">
                  GHS {totalWalletBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Transactions</p>
                <p className="font-display text-2xl font-bold">{stats.pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Wallet Funding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-primary">
              GHS {stats.totalFunding.toFixed(2)}
            </p>
            {todayStats && (
              <p className="text-xs text-muted-foreground mt-1">
                Today: GHS {todayStats.funding.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Total Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-accent">
              GHS {stats.totalPurchases.toFixed(2)}
            </p>
            {todayStats && (
              <p className="text-xs text-muted-foreground mt-1">
                Today: GHS {todayStats.purchases.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/30 to-secondary/50 border-secondary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-foreground">
              GHS {stats.totalCommissions.toFixed(2)}
            </p>
            {todayStats && (
              <p className="text-xs text-muted-foreground mt-1">
                Today: GHS {todayStats.commissions.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Trends (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorFunding" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₵${value}`}
                  className="text-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`GHS ${value.toFixed(2)}`, ""]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="funding"
                  name="Funding"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorFunding)"
                />
                <Area
                  type="monotone"
                  dataKey="purchases"
                  name="Purchases"
                  stroke="hsl(var(--accent))"
                  fillOpacity={1}
                  fill="url(#colorPurchases)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Comparison Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₵${value}`}
                  className="text-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`GHS ${value.toFixed(2)}`, ""]}
                />
                <Legend />
                <Bar dataKey="funding" name="Funding" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="Purchases" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commissions" name="Commissions" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Role Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {["client", "basic_agent", "master_agent", "premier_agent", "elite_agent", "admin"].map(
              (role) => {
                const count = users.filter((u) => u.role === role).length;
                const percentage = totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : "0";
                const label = role
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ");

                return (
                  <div key={role} className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="font-display text-2xl font-bold text-foreground">
                      {count}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{label}</p>
                    <p className="text-xs text-primary mt-0.5">{percentage}%</p>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
