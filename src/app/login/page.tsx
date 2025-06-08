
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp } from "lucide-react";
import Link from 'next/link'; // Standard Next.js Link
import { useRouter } from 'next/navigation'; // Standard Next.js Router

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const appName = "DebtVision | رؤية الديون";
  const pageTitle = "تسجيل الدخول";
  const pageDescription = "قم بالوصول إلى حساب DebtVision الخاص بك";
  const emailLabel = "البريد الإلكتروني";
  const emailPlaceholder = "you@example.com";
  const passwordLabel = "كلمة المرور";
  const loginButtonText = "تسجيل الدخول";
  const loadingLoginButtonText = "جاري تسجيل الدخول...";
  const signupPromptText = "ليس لديك حساب؟";
  const signupLinkText = "إنشاء حساب";
  const toastLoginSuccessTitle = "تم تسجيل الدخول بنجاح";
  const toastLoginSuccessDescription = "جاري التوجيه إلى لوحة التحكم...";
  const toastLoginFailedTitle = "فشل تسجيل الدخول";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: toastLoginSuccessTitle, description: toastLoginSuccessDescription });
      router.push(`/dashboard`); 
    } catch (err: any) {
      let errorMessage = err.message;
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        errorMessage = "البريد الإلكتروني أو كلمة المرور غير صالحة.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "عنوان البريد الإلكتروني غير صالح.";
      }
      setError(errorMessage);
      toast({ title: toastLoginFailedTitle, description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center mb-8 text-primary">
        <TrendingUp className="h-10 w-10 ml-3 rtl:mr-0 rtl:ml-3" />
        <h1 className="text-4xl font-headline font-bold">{appName}</h1>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">{pageTitle}</CardTitle>
          <CardDescription className="text-center">{pageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{emailLabel}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={emailPlaceholder}
                required
                className="bg-white dark:bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{passwordLabel}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white dark:bg-input"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? loadingLoginButtonText : loginButtonText}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm">
            {signupPromptText}{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              {signupLinkText}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
