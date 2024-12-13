import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="md:hidden mb-4 flex items-center gap-2">
            <SidebarTrigger />
            <div className="h-8 w-8 rounded-full bg-primary"></div>
            <h1 className="text-xl font-bold">Universal KYC</h1>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;