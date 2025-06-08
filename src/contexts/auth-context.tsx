
"use client";

import type { User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, usePathname } from 'next/navigation'; // Standard Next.js

interface AuthContextType {
  user: User | null;
  loading: boolean;
  businessName: string | null;
  setBusinessNameInContext: (name: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessNameState] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const storedBusinessName = localStorage.getItem('app_business_name_' + currentUser.uid);
        setBusinessNameState(storedBusinessName);
      } else {
        setBusinessNameState(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const setBusinessNameInContext = (name: string | null) => {
    setBusinessNameState(name);
    if (user && name) {
      localStorage.setItem('app_business_name_' + user.uid, name);
    } else if (user && name === null) {
      localStorage.removeItem('app_business_name_' + user.uid);
    }
  };

  useEffect(() => {
    if (loading) {
      return;
    }
    const isLoginPage = pathname === '/login';
    const isSignupPage = pathname === '/signup';
    const isAuthPage = isLoginPage || isSignupPage;

    // Ensure pathname exists before trying to check if it starts with something
    if (pathname && !user && !isAuthPage && !pathname.startsWith('/_next/') && pathname !== '/favicon.ico' && !pathname.endsWith('/favicon.ico')) {
      router.replace(`/login`);
    } else if (user && isAuthPage) {
      router.replace(`/dashboard`);
    }
  }, [user, loading, router, pathname]); 

  return (
    <AuthContext.Provider value={{ user, loading, businessName, setBusinessNameInContext }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("يجب استخدام useAuth ضمن AuthProvider");
  }
  return context;
}
