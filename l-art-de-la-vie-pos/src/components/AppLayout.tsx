import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WalletCards } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CashOpeningDialog } from "@/components/CashOpeningDialog";
import { useStore } from "@/context/StoreContext";

const CashPromptContext = createContext<(() => void) | null>(null);
export const useCashPrompt = () => useContext(CashPromptContext);

export function AppLayout({ children }: { children: ReactNode }) {
  const { cashOpening } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [cashPromptOpen, setCashPromptOpen] = useState(!cashOpening);

  useEffect(() => { if (cashOpening) setCashPromptOpen(false); }, [cashOpening]);

  const continueWithInventory = () => {
    setCashPromptOpen(false);
    navigate("/inventario");
  };

  return (
    <CashPromptContext.Provider value={() => setCashPromptOpen(true)}><SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4 bg-card">
            <SidebarTrigger />
            <div className="ml-auto">
              {!cashOpening && <button type="button" onClick={() => setCashPromptOpen(true)} className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-accent/20"><span className="h-2 w-2 rounded-full bg-accent" /><WalletCards className="h-3.5 w-3.5 text-primary" />Caja pendiente <span className="hidden text-primary sm:inline">· Abrir</span></button>}
            </div>
          </header>
          <div key={location.pathname} className="page-enter flex-1 p-4 overflow-auto sm:p-6">
            {children}
          </div>
        </main>
      </div>
      <CashOpeningDialog open={cashPromptOpen} onOpenChange={setCashPromptOpen} onInventory={continueWithInventory} />
    </SidebarProvider></CashPromptContext.Provider>
  );
}
