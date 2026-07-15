import { useStore } from "@/context/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(127,100%,12%)", "hsl(49,55%,52%)", "hsl(127,60%,30%)", "hsl(49,40%,40%)"];

export default function Dashboard() {
  const { products, sales } = useStore();

  const today = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter((s) => s.date.startsWith(today));
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);

  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const weekSales = sales.filter((s) => new Date(s.date) >= weekAgo);
  const weekTotal = weekSales.reduce((sum, s) => sum + s.total, 0);

  const monthTotal = sales.reduce((sum, s) => sum + s.total, 0);

  const lowStock = products.filter((p) => p.stock <= p.minStock);

  // Sales by category
  const categoryData = ["Decoración", "Perfumes", "Carteras", "Varios"].map((cat) => {
    const catProducts = products.filter((p) => p.category === cat);
    return { name: cat, stock: catProducts.reduce((s, p) => s + p.stock, 0) };
  });
  const categoryChartData = categoryData.filter((category) => category.stock > 0);
  const totalStock = categoryData.reduce((total, category) => total + category.stock, 0);

  // Top products by sales count
  const productSalesMap: Record<string, { name: string; count: number }> = {};
  sales.forEach((sale) =>
    sale.items.forEach((item) => {
      if (!productSalesMap[item.productId]) productSalesMap[item.productId] = { name: item.productName, count: 0 };
      productSalesMap[item.productId].count += item.quantity;
    })
  );
  const topProducts = Object.values(productSalesMap).sort((a, b) => b.count - a.count).slice(0, 5);

  // Daily sales chart (last 7 days)
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const total = sales.filter((s) => s.date.startsWith(key)).reduce((sum, s) => sum + s.total, 0);
    return { day: d.toLocaleDateString("es", { weekday: "short" }), total };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-sans font-medium text-muted-foreground">Ventas Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-sans">L {todayTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{todaySales.length} transacciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-sans font-medium text-muted-foreground">Ventas Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-sans">L {weekTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{weekSales.length} transacciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-sans font-medium text-muted-foreground">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-sans">{products.length}</p>
            <p className="text-xs text-muted-foreground">{products.reduce((s, p) => s + p.stock, 0)} unidades</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-sans font-medium text-muted-foreground">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-sans">{lowStock.length}</p>
            <p className="text-xs text-muted-foreground">productos bajo mínimo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-sans">Ventas Últimos 7 Días</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(80,15%,88%)" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `L ${v.toFixed(2)}`} />
                <Tooltip formatter={(v: number) => [`L ${v.toFixed(2)}`, "Ventas"]} />
                <Bar dataKey="total" fill="hsl(127,100%,12%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory by category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-sans">Inventario por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="grid min-h-64 grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_190px]">
            <div className="h-52 min-w-0">
              {totalStock > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="stock"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={categoryChartData.length > 1 ? 3 : 0}
                      stroke="hsl(var(--card))"
                      strokeWidth={3}
                    >
                      {categoryChartData.map((category) => {
                        const colorIndex = categoryData.findIndex((item) => item.name === category.name);
                        return <Cell key={category.name} fill={COLORS[colorIndex]} />;
                      })}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} unidades`, "Stock"]} />
                    <text x="50%" y="47%" textAnchor="middle" className="fill-muted-foreground text-[11px]">
                      Total
                    </text>
                    <text x="50%" y="58%" textAnchor="middle" className="fill-foreground text-xl font-bold">
                      {totalStock}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 text-center">
                  <Package className="mb-2 h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-medium">Inventario vacío</p>
                  <p className="text-xs text-muted-foreground">Agrega existencias para ver la distribución.</p>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              {categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between gap-3 rounded-lg border bg-background/60 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="truncate text-xs text-muted-foreground">{category.name}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{category.stock}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-sans">Top Productos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sin datos de ventas aún.</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-accent w-6">{i + 1}.</span>
                      <span className="text-sm">{p.name}</span>
                    </div>
                    <Badge variant="secondary">{p.count} vendidos</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low stock alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-sans">Alertas de Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-muted-foreground text-sm">Todo el inventario está en niveles adecuados.</p>
            ) : (
              <div className="space-y-3">
                {lowStock.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.code}</p>
                    </div>
                    <Badge variant="destructive">{p.stock} / {p.minStock} mín.</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
