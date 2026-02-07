import { useState, useMemo } from "react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAdminTransactions } from "@/hooks/useAdminTransactions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Receipt,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Loader2,
  Activity,
  Target,
  DollarSign,
  UserPlus,
  Percent,
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
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import { format, subDays, startOfDay, differenceInDays, parseISO } from "date-fns";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(var(--accent-foreground))",
  "hsl(var(--muted-foreground))",
  "hsl(142 76% 36%)",
  "hsl(38 92% 50%)",
];

const NETWORK_COLORS: Record<string, string> = {
  MTN: "hsl(48 96% 53%)",
  Telecel: "hsl(0 84% 60%)",
  AirtelTigo: "hsl(210 79% 46%)",
};

export const AdminAnalytics = () => {
  const { users, loading: usersLoading } = useAdminUsers();
  const { transactions, stats, dailyStats, loading: txLoading } = useAdminTransactions();
  const [dateRange, setDateRange] = useState("14");

  const loading = usersLoading || txLoading;

  // Calculate advanced metrics
  const metrics = useMemo(() => {
    if (!users.length && !transactions.length) {
      return {
        avgTransactionValue: 0,
        conversionRate: 0,
        userGrowthRate: 0,
        revenueGrowthRate: 0,
        topNetwork: "N/A",
        peakHour: "N/A",
        avgUserBalance: 0,
        totalRevenue: 0,
        activeUsersRate: 0,
      };
    }

    const completedTx = transactions.filter((t) => t.status === "completed");
    const purchaseTx = completedTx.filter((t) => t.type === "data_purchase");
    const avgTransactionValue =
      purchaseTx.length > 0
        ? purchaseTx.reduce((sum, t) => sum + Math.abs(t.amount), 0) / purchaseTx.length
        : 0;

    // Users who made at least one purchase
    const activeUserIds = new Set(purchaseTx.map((t) => t.user_id));
    const conversionRate = users.length > 0 ? (activeUserIds.size / users.length) * 100 : 0;

    // User growth - compare users from last 7 days vs prior 7 days
    const now = new Date();
    const recentUsers = users.filter(
      (u) => differenceInDays(now, new Date(u.created_at)) <= 7
    ).length;
    const priorUsers = users.filter(
      (u) =>
        differenceInDays(now, new Date(u.created_at)) > 7 &&
        differenceInDays(now, new Date(u.created_at)) <= 14
    ).length;
    const userGrowthRate = priorUsers > 0 ? ((recentUsers - priorUsers) / priorUsers) * 100 : recentUsers > 0 ? 100 : 0;

    // Revenue growth
    const recentDays = parseInt(dateRange) / 2;
    const recentRevenue = dailyStats.slice(-recentDays).reduce((sum, d) => sum + d.purchases, 0);
    const priorRevenue = dailyStats
      .slice(-parseInt(dateRange), -recentDays)
      .reduce((sum, d) => sum + d.purchases, 0);
    const revenueGrowthRate =
      priorRevenue > 0 ? ((recentRevenue - priorRevenue) / priorRevenue) * 100 : recentRevenue > 0 ? 100 : 0;

    // Average user balance
    const avgUserBalance =
      users.length > 0 ? users.reduce((sum, u) => sum + u.wallet_balance, 0) / users.length : 0;

    // Active users rate (users with transactions in last 7 days)
    const recentTxUsers = new Set(
      transactions
        .filter((t) => differenceInDays(now, new Date(t.created_at)) <= 7)
        .map((t) => t.user_id)
    );
    const activeUsersRate = users.length > 0 ? (recentTxUsers.size / users.length) * 100 : 0;

    return {
      avgTransactionValue,
      conversionRate,
      userGrowthRate,
      revenueGrowthRate,
      topNetwork: "MTN",
      peakHour: "2PM - 4PM",
      avgUserBalance,
      totalRevenue: stats.totalPurchases,
      activeUsersRate,
    };
  }, [users, transactions, dailyStats, stats, dateRange]);

  // Role distribution data for pie chart
  const roleDistribution = useMemo(() => {
    const roleCounts: Record<string, number> = {};
    users.forEach((u) => {
      const label = u.role
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      roleCounts[label] = (roleCounts[label] || 0) + 1;
    });

    return Object.entries(roleCounts).map(([name, value]) => ({ name, value }));
  }, [users]);

  // Transaction type breakdown
  const txTypeBreakdown = useMemo(() => {
    const typeCounts: Record<string, { count: number; amount: number }> = {};
    transactions.forEach((t) => {
      const label = t.type
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      if (!typeCounts[label]) typeCounts[label] = { count: 0, amount: 0 };
      typeCounts[label].count += 1;
      typeCounts[label].amount += Math.abs(t.amount);
    });

    return Object.entries(typeCounts).map(([name, data]) => ({
      name,
      count: data.count,
      amount: data.amount,
    }));
  }, [transactions]);

  // User registration trend (last 30 days)
  const registrationTrend = useMemo(() => {
    const days = 30;
    const trend: { date: string; newUsers: number; cumulative: number }[] = [];
    let cumulative = 0;

    for (let i = days - 1; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const dayStr = format(day, "MMM dd");
      const count = users.filter((u) => {
        const createdAt = startOfDay(new Date(u.created_at));
        return format(createdAt, "MMM dd") === dayStr;
      }).length;
      cumulative += count;
      trend.push({ date: dayStr, newUsers: count, cumulative });
    }

    return trend;
  }, [users]);

  // Hourly activity pattern
  const hourlyActivity = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, "0")}:00`,
      transactions: 0,
    }));

    transactions.forEach((t) => {
      const hour = new Date(t.created_at).getHours();
      hours[hour].transactions += 1;
    });

    return hours;
  }, [transactions]);

  // Export analytics data
  const handleExport = () => {
    const csvData = [
      ["Metric", "Value"],
      ["Total Users", users.length.toString()],
      ["Total Revenue (GHS)", stats.totalPurchases.toFixed(2)],
      ["Total Funding (GHS)", stats.totalFunding.toFixed(2)],
      ["Total Commissions (GHS)", stats.totalCommissions.toFixed(2)],
      ["Average Transaction Value (GHS)", metrics.avgTransactionValue.toFixed(2)],
      ["Conversion Rate (%)", metrics.conversionRate.toFixed(1)],
      ["Active Users Rate (%)", metrics.activeUsersRate.toFixed(1)],
      ["User Growth Rate (%)", metrics.userGrowthRate.toFixed(1)],
      ["Revenue Growth Rate (%)", metrics.revenueGrowthRate.toFixed(1)],
      [""],
      ["Daily Stats"],
      ["Date", "Funding", "Purchases", "Commissions"],
      ...dailyStats.map((d) => [d.date, d.funding.toFixed(2), d.purchases.toFixed(2), d.commissions.toFixed(2)]),
    ];

    const csv = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Advanced insights into platform performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="font-display text-2xl font-bold mt-1">
                  GHS {metrics.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {metrics.revenueGrowthRate >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-primary" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-destructive" />
              )}
              <span
                className={`text-sm font-medium ${metrics.revenueGrowthRate >= 0 ? "text-primary" : "text-destructive"}`}
              >
                {Math.abs(metrics.revenueGrowthRate).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs prior period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="font-display text-2xl font-bold mt-1">
                  {metrics.activeUsersRate.toFixed(0)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {users.length} total users
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                <p className="font-display text-2xl font-bold mt-1">
                  GHS {metrics.avgTransactionValue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {transactions.filter((t) => t.type === "data_purchase").length} purchases
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">User Growth</p>
                <p className="font-display text-2xl font-bold mt-1">
                  {metrics.userGrowthRate >= 0 ? "+" : ""}
                  {metrics.userGrowthRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {metrics.userGrowthRate >= 0 ? (
                <TrendingUp className="w-4 h-4 text-primary" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className="text-xs text-muted-foreground">vs prior 7 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Percent className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="font-display text-2xl font-bold text-primary">
                  {metrics.conversionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Users who made purchases
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-accent-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. User Balance</p>
                <p className="font-display text-2xl font-bold text-accent-foreground">
                  GHS {metrics.avgUserBalance.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Across all wallets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/30 to-secondary/50 border-secondary/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Commissions</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  GHS {stats.totalCommissions.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Referral earnings paid
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                Funding, purchases, and commissions over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyStats}>
                    <defs>
                      <linearGradient id="colorFundingAnalytics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₵${value}`}
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
                      fill="url(#colorFundingAnalytics)"
                    />
                    <Bar
                      dataKey="purchases"
                      name="Purchases"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="commissions"
                      name="Commissions"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Funding</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Purchases</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Commissions</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyStats
                      .slice(-parseInt(dateRange))
                      .reverse()
                      .map((day) => (
                        <tr key={day.date} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium">{day.date}</td>
                          <td className="py-3 px-4 text-right text-primary">
                            GHS {day.funding.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            GHS {day.purchases.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground">
                            GHS {day.commissions.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            GHS {(day.funding - day.purchases - day.commissions).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Registration Trend</CardTitle>
                <CardDescription>New user signups over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={registrationTrend}>
                      <defs>
                        <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval={4}
                      />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="newUsers"
                        name="New Users"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorNewUsers)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
                <CardDescription>Breakdown by agent tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {roleDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cumulative Users */}
          <Card>
            <CardHeader>
              <CardTitle>Cumulative User Growth</CardTitle>
              <CardDescription>Total users over time (last 30 days of signups)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={registrationTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval={4}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      name="Total Users"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Transaction Activity</CardTitle>
              <CardDescription>
                When users are most active on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval={2}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="transactions"
                      name="Transactions"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {["completed", "pending", "failed", "processing"].map((status) => {
              const count = transactions.filter((t) => t.status === status).length;
              const percentage = transactions.length > 0 ? ((count / transactions.length) * 100).toFixed(1) : "0";
              const statusColors: Record<string, string> = {
                completed: "text-primary bg-primary/10",
                pending: "text-accent-foreground bg-accent/50",
                failed: "text-destructive bg-destructive/10",
                processing: "text-muted-foreground bg-muted",
              };

              return (
                <Card key={status}>
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center ${statusColors[status]}`}
                    >
                      <span className="font-display text-xl font-bold">{count}</span>
                    </div>
                    <p className="font-medium mt-3 capitalize">{status}</p>
                    <p className="text-sm text-muted-foreground">{percentage}% of all</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Type Breakdown</CardTitle>
              <CardDescription>Volume and amount by transaction type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={txTypeBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        name === "Amount" ? `GHS ${value.toFixed(2)}` : value,
                        name,
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="amount" name="Amount" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Role breakdown table */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Tier Performance</CardTitle>
              <CardDescription>Transaction volume by user role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Users</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total Balance</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Avg Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["client", "basic_agent", "master_agent", "premier_agent", "elite_agent", "admin"].map(
                      (role) => {
                        const roleUsers = users.filter((u) => u.role === role);
                        const totalBalance = roleUsers.reduce((sum, u) => sum + u.wallet_balance, 0);
                        const avgBalance = roleUsers.length > 0 ? totalBalance / roleUsers.length : 0;
                        const label = role
                          .split("_")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ");

                        return (
                          <tr key={role} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4 font-medium">{label}</td>
                            <td className="py-3 px-4 text-right">{roleUsers.length}</td>
                            <td className="py-3 px-4 text-right">
                              GHS {totalBalance.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right text-muted-foreground">
                              GHS {avgBalance.toFixed(2)}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
