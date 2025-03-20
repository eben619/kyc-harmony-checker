import { User, Shield, Lock, Bell, DollarSign, BookOpen } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Account", icon: User, path: "/account" },
  { title: "KYC Verification", icon: Shield, path: "/kyc" },
  { title: "Proofs / Privacy", icon: Lock, path: "/privacy" },
  { title: "Notifications", icon: Bell, path: "/notifications" },
  { title: "Tax Information", icon: DollarSign, path: "/tax" },
  { title: "FAQ / Terms", icon: BookOpen, path: "/language" },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full">
            <img 
              src="/lovable-uploads/dc77b3f0-99e1-4d66-bb4b-d4f491673715.png" 
              alt="RevenuID Logo" 
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">RevenuID</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title} className="py-2">
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                    className="h-14 text-lg"
                  >
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className="flex w-full items-center gap-3"
                    >
                      <item.icon className="h-6 w-6" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
