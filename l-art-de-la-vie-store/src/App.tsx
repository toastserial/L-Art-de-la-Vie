import { CartDrawer } from "@/components/cart/CartDrawer";
import { Benefits } from "@/components/home/Benefits";
import { Hero } from "@/components/home/Hero";
import { MarketingVideos } from "@/components/home/MarketingVideos";
import { ProductSection } from "@/components/home/ProductSection";
import { StoreInformation } from "@/components/home/StoreInformation";
import { TransferInformation } from "@/components/home/TransferInformation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TopBar } from "@/components/layout/TopBar";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";

export default function App() {
  return (
    <div className="min-h-dvh bg-[color:var(--paper)]">
      <TopBar />
      <Header />
      <main>
        <Hero />
        <Benefits />
        <ProductSection />
        <MarketingVideos />
        <StoreInformation />
        <TransferInformation />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
