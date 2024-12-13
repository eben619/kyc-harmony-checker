import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Account from "./pages/Account";
import KYCForm from "./components/KYCForm";
import Privacy from "./pages/Privacy";
import Notifications from "./pages/Notifications";
import Tax from "./pages/Tax";
import Language from "./pages/Language";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Account />} />
            <Route path="/account" element={<Account />} />
            <Route path="/kyc" element={<KYCForm />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/tax" element={<Tax />} />
            <Route path="/language" element={<Language />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;