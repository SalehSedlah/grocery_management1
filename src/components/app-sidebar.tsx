"use client";

import { LogOut, TrendingUp } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import type { NavLink as NavLinkTypeDefinition } from "@/config/links"; 
import { mainNavLinks, secondaryNavLinks } from "@/config/links"; 
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link'; 
import { useRouter, usePathname } from 'next/navigation'; 

export function AppSidebar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter(); 
  const { state: sidebarState } = useSidebar();
  
  const appName = "رؤية الديون";

  // أضفت مفتاح 'statements' هنا لتجنب الخطأ المؤقت:
  const navLabels: Record<NavLinkTypeDefinition['labelKey'], string> = {
    dashboard: "لوحة التحكم",
    debtManagement: "إدارة الديون",
    aiAssistant: "المساعد الذكي",
    products: "المنتجات",
    settings: "إدارة الحساب",
    statements: "الكشوفات"  // <-- المفتاح المضاف
  };

  const toastLogoutSuccessTitle = "تم تسجيل الخروج";
  const toastLogoutSuccessDescription = "لقد تم تسجيل خروجك بنجاح.";
  const toastLogoutFailedTitle = "فشل تسجيل الخروج";
  const logoutButtonText = "تسجيل الخروج";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: toastLogoutSuccessTitle, description: toastLogoutSuccessDescription });
      router.push(`/login`);
    } catch (error: any) {
      toast({ title: toastLogoutFailedTitle, description: error.message, variant: "destructive" });
    }
  };

  const renderNavLink = (link: NavLinkTypeDefinition, index: number) => {
    const label = link.label; // استخدام النص من config مباشرة
    const isActive = !!(pathname === link.href || (pathname && link.href !== '/' && pathname.startsWith(link.href)));

    return (
      <SidebarMenuItem key={`${link.labelKey}-${index}`}>
        <Link href={link.href} passHref legacyBehavior>
          <SidebarMenuButton
            asChild
            isActive={isActive}
            tooltip={sidebarState === "collapsed" ? label : undefined} 
          >
            <a>
              <link.icon />
              <span>{label}</span> 
            </a>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary"> 
          <TrendingUp className="h-8 w-8" />
          {sidebarState === "expanded" && <span className="text-xl font-headline font-semibold">{appName}</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {loading && (
            <>
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
            </>
          )}
          {!loading && mainNavLinks.map(renderNavLink)}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarContent className="p-2">
        <SidebarMenu>
          {!loading && secondaryNavLinks.map((link, index) => renderNavLink(link, index))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={sidebarState === "collapsed" ? logoutButtonText : undefined}>
                <LogOut />
                <span>{logoutButtonText}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
