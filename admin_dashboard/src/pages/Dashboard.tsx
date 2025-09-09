import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Package
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SimpleChart } from "@/components/dashboard/SimpleChart";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { metrics, loading, orders } = useDashboardData();

  // Generate chart data for sales trends
  const salesData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.toDateString() === date.toDateString();
    });
    
    return {
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      sales: dayOrders.reduce((sum, order) => sum + order.totalPrice, 0),
      orders: dayOrders.length,
    };
  });

  // Generate top products data
  const productSales = new Map<string, number>();
  orders.forEach(order => {
    order.products.forEach(product => {
      const current = productSales.get(product.name) || 0;
      productSales.set(product.name, current + (product.price * product.quantity));
    });
  });

  const topProducts = Array.from(productSales.entries())
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Monitor your e-commerce performance and key metrics
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders.toString()}
          change="+12% from last month"
          changeType="positive"
          icon={ShoppingCart}
          gradient="bg-gradient-primary"
        />
        <MetricCard
          title="Total Sales"
          value={`$${metrics.totalSales.toLocaleString()}`}
          change="+8% from last month"
          changeType="positive"
          icon={DollarSign}
          gradient="bg-gradient-success"
        />
        <MetricCard
          title="Total Customers"
          value={metrics.totalCustomers.toString()}
          change="+5% from last month"
          changeType="positive"
          icon={Users}
          gradient="bg-primary"
        />
        <MetricCard
          title="Out of Stock"
          value={metrics.outOfStockCount.toString()}
          change="-2 from last week"
          changeType="positive"
          icon={AlertTriangle}
          gradient="bg-gradient-warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Sales Trend (Last 7 Days)
              </CardTitle>
              <CardDescription>
                Daily sales performance overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleChart
                data={salesData}
                type="area"
                dataKey="sales"
                xAxisKey="date"
                color="hsl(var(--chart-1))"
                height={300}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-success" />
                Top Products by Revenue
              </CardTitle>
              <CardDescription>
                Best performing products this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleChart
                data={topProducts}
                type="bar"
                dataKey="sales"
                xAxisKey="name"
                color="hsl(var(--chart-2))"
                height={300}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Order Status Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Order Status Overview</CardTitle>
            <CardDescription>
              Current order distribution by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["pending", "shipped", "delivered"].map((status) => {
                const statusOrders = orders.filter(order => order.status === status);
                const percentage = ((statusOrders.length / orders.length) * 100).toFixed(1);
                
                return (
                  <div key={status} className="text-center p-4 border rounded-lg">
                    <div className={`status-badge status-${status} mx-auto mb-2`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                    <div className="text-2xl font-bold">{statusOrders.length}</div>
                    <div className="text-sm text-muted-foreground">{percentage}% of total</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;