
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { Celo } from '@thirdweb-dev/chains';
import { SelfProviderWrapper } from "@/contexts/SelfContext";
import NotificationBell from "./notifications/NotificationBell";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const clientId = "762b809ae68c1dbc7642eab534e6942b";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <ThirdwebProvider 
      activeChain={Celo}
      clientId={clientId}
      supportedChains={[Celo]}
    >
      <SelfProviderWrapper>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background text-foreground">
            <AppSidebar />
            <main className="flex-1 p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="md:hidden">
                  <SidebarTrigger />
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <NotificationBell />
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
              <div className="text-foreground">{children}</div>
            </main>
          </div>
        </SidebarProvider>
      </SelfProviderWrapper>
    </ThirdwebProvider>
  );
};

export default Layout;
