
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation'; // Standard Next.js

export function AppHeader() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const router = useRouter();

  const toastLogoutSuccessTitle = "تم تسجيل الخروج";
  const toastLogoutSuccessDescription = "لقد تم تسجيل خروجك بنجاح.";
  const toastLogoutFailedTitle = "فشل تسجيل الخروج";
  const userAvatarHintText = "الصورة الرمزية للمستخدم";
  const userInitialsFallbackText = "DV";
  const logoutMenuItemText = "تسجيل الخروج";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: toastLogoutSuccessTitle, description: toastLogoutSuccessDescription });
      router.push(`/login`); 
    } catch (error: any) {
      toast({ title: toastLogoutFailedTitle, description: error.message, variant: "destructive" });
    }
  };
  
  const getInitials = (email?: string | null) => {
    if (!email) return userInitialsFallbackText; 
    const parts = email.split("@")[0].split(/[\s._-]+/); 
    if (parts.length > 1 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {isMobile && <SidebarTrigger />}
      <div className="flex-1" />
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "مستخدم"} data-ai-hint={userAvatarHintText} />
                <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal text-right">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.displayName || "مستخدم"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex justify-end">
              <span>{logoutMenuItemText}</span>
              <LogOut className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
