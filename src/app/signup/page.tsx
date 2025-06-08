
"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp } from "lucide-react";
import Link from 'next/link'; // Standard Next.js Link
import { useRouter } from 'next/navigation'; // Standard Next.js Router

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const appName = "DebtVision | رؤية الديون";
  const pageTitle = "إنشاء حساب";
  const pageDescription = "انضم إلى DebtVision اليوم";
  const emailLabel = "البريد الإلكتروني";
  const emailPlaceholder = "you@example.com";
  const passwordLabel = "كلمة المرور";
  const confirmPasswordLabel = "تأكيد كلمة المرور";
  const businessNameLabel = "اسم البقالة / النشاط التجاري";
  const businessNamePlaceholder = "بقالة الوفاء";
  const signupButtonText = "إنشاء حساب";
  const loadingSignupButtonText = "جاري إنشاء الحساب...";
  const loginPromptText = "هل لديك حساب بالفعل؟";
  const loginLinkText = "تسجيل الدخول";
  const toastSignupSuccessTitle = "تم إنشاء الحساب بنجاح";
  const toastSignupSuccessDescription = "جاري التوجيه إلى لوحة التحكم...";
  const toastSignupFailedTitle = "فشل إنشاء الحساب";

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      const specificError = "كلمتا المرور غير متطابقتين.";
      setError(specificError);
      toast({ title: toastSignupFailedTitle, description: specificError, variant: "destructive" });
      setLoading(false);
      return;
    }
    if (!businessName.trim()) {
        const specificError = "الرجاء إدخال اسم البقالة / النشاط التجاري.";
        setError(specificError);
        toast({ title: toastSignupFailedTitle, description: specificError, variant: "destructive" });
        setLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user) {
        localStorage.setItem('app_business_name_' + user.uid, businessName.trim());
      }
      toast({ title: toastSignupSuccessTitle, description: toastSignupSuccessDescription });
      router.push(`/dashboard`); 
    } catch (err: any) {
      let errorMessage = err.message;
       if (err.code === "auth/email-already-in-use") {
        errorMessage = "عنوان البريد الإلكتروني هذا مستخدم بالفعل.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "كلمة المرور ضعيفة جدًا. يرجى استخدام كلمة مرور أقوى.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "عنوان البريد الإلكتروني غير صالح.";
      }
      setError(errorMessage);
      toast({ title: toastSignupFailedTitle, description: errorMessage, variant: "destructive" });
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
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">{businessNameLabel}</Label> 
              <Input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder={businessNamePlaceholder}
                required
                className="bg-white dark:bg-input"
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{confirmPasswordLabel}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white dark:bg-input"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? loadingSignupButtonText : signupButtonText}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm">
            {loginPromptText}{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {loginLinkText}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
