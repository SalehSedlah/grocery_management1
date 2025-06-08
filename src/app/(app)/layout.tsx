
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from 'next/navigation'; // Standard Next.js
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const loadingSessionText = "جاري تحميل جلسة المستخدم...";

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login`); 
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-[250px]" />
          <p className="text-sm text-muted-foreground">{loadingSessionText}</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode; }) {
  return (
    <AuthGuard>
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col">
            <AppHeader />
            <main className="flex-1 overflow-y-auto p-6 bg-background">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
