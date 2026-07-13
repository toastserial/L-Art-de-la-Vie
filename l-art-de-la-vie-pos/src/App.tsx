import { ReactNode } from "react";
import { Navigate, BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { supabaseConfigError } from "@/lib/supabase";
import { StoreProvider, useStore } from "@/context/StoreContext";
import { AppLayout } from "@/components/AppLayout";
import { CashOpeningDialog } from "@/components/CashOpeningDialog";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";
import CashClose from "./pages/CashClose";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const FullScreenMessage = ({ children }: { children: ReactNode }) => <div className="min-h-screen grid place-items-center p-6 text-center">{children}</div>;

function StoreGate({ children }: { children: ReactNode }) {
  const { loading, error, refresh } = useStore();
  if (loading) return <FullScreenMessage><p className="text-muted-foreground">Cargando información de la tienda...</p></FullScreenMessage>;
  if (error) return <FullScreenMessage><div className="max-w-md space-y-4"><h1 className="text-xl font-bold">No se pudo conectar con el backend</h1><p className="text-muted-foreground">{error}</p><Button onClick={() => refresh().catch(() => undefined)}>Reintentar</Button></div></FullScreenMessage>;
  return <>{children}</>;
}

function ProtectedApp() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenMessage><p className="text-muted-foreground">Verificando sesión...</p></FullScreenMessage>;
  if (!user) return <Navigate to="/login" replace />;
  return <StoreProvider><StoreGate><CashOpeningDialog /><AppLayout><Routes><Route path="/" element={<Dashboard />} /><Route path="/inventario" element={<Inventory />} /><Route path="/pos" element={<POS />} /><Route path="/cierre" element={<CashClose />} /><Route path="*" element={<NotFound />} /></Routes></AppLayout></StoreGate></StoreProvider>;
}

export default function App() {
  if (supabaseConfigError) return <FullScreenMessage><div className="max-w-lg rounded-xl border bg-card p-8 shadow-sm space-y-3"><h1 className="text-2xl font-bold">Falta configurar Supabase</h1><p className="text-muted-foreground">{supabaseConfigError}</p><p className="text-sm">Completa esas variables y reinicia <code className="rounded bg-muted px-1.5 py-0.5">npm run dev</code>.</p></div></FullScreenMessage>;
  return <QueryClientProvider client={queryClient}><TooltipProvider><BrowserRouter><AuthProvider><Toaster /><Sonner /><Routes><Route path="/login" element={<Login />} /><Route path="/reset-password" element={<ResetPassword />} /><Route path="/*" element={<ProtectedApp />} /></Routes></AuthProvider></BrowserRouter></TooltipProvider></QueryClientProvider>;
}
