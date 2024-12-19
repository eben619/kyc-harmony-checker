import { User, Shield, Lock, Bell, DollarSign, Globe } from "lucide-react";
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
  { title: "Privacy", icon: Lock, path: "/privacy" },
  { title: "Notifications", icon: Bell, path: "/notifications" },
  { title: "Tax Information", icon: DollarSign, path: "/tax" },
  { title: "Language", icon: Globe, path: "/language" },
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
          <div className="h-10 w-10 rounded-full bg-primary"></div>
          <h1 className="text-2xl font-bold">Universal KYC</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title} className="py-1">
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                    className="h-12 text-base"
                  >
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className="flex w-full items-center gap-3"
                    >
                      <item.icon className="h-5 w-5" />
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