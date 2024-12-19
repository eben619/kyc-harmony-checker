import { User, Shield, Lock, Bell, DollarSign, Globe } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import UserProfile from "./user/UserProfile";
import { useUser } from "@supabase/auth-helpers-react";

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
  const user = useUser();

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          {user && <UserProfile user={user} />}
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
                      className="flex w-full items-center gap-4"
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