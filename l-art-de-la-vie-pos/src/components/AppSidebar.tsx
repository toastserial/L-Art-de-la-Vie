import { LayoutDashboard, LogOut, Package, ShoppingCart, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Inventario", url: "/inventario", icon: Package },
  { title: "Punto de Venta", url: "/pos", icon: ShoppingCart },
  { title: "Cierre de Caja", url: "/cierre", icon: Wallet },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const roleName = user?.role === "owner" ? "Propietario" : user?.role === "admin" ? "Administrador" : "Cajero";
  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-6 pb-4">
        <div className="flex flex-col items-center gap-1">
          <h1 className="font-display text-xl font-bold tracking-wide text-sidebar-primary">
            L'Art de la Vie
          </h1>
          <p className="text-xs text-sidebar-foreground/60 tracking-widest uppercase">
            Tienda & Gestión
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11">
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-4 rounded-lg transition-colors text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/60 p-3">
          <div className="h-9 w-9 shrink-0 rounded-full bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center font-semibold">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.fullName}</p>
            <p className="text-xs text-sidebar-foreground/60">{roleName}</p>
          </div>
          <button type="button" onClick={() => signOut()} className="rounded-md p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground" aria-label="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
