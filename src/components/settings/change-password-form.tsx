
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";

const changePasswordFormSchema = z.object({
  newPassword: z.string().min(6, { message: "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين.",
  path: ["confirmPassword"], // Point error to confirmPassword field
});

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export function ChangePasswordForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const newPasswordLabel = "كلمة المرور الجديدة";
  const confirmPasswordLabel = "تأكيد كلمة المرور الجديدة";
  const saveButtonText = "تغيير كلمة المرور";
  const savingButtonText = "جاري التغيير...";
  const toastSuccessTitle = "تم تغيير كلمة المرور";
  const toastSuccessDescription = "تم تحديث كلمة مرورك بنجاح.";
  const toastErrorTitle = "خطأ في تغيير كلمة المرور";
  const recentLoginErrorDescription = "تتطلب هذه العملية تسجيل دخول حديث. يرجى تسجيل الخروج ثم إعادة تسجيل الدخول والمحاولة مرة أخرى.";

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ChangePasswordFormValues) {
    if (!user) return;
    setLoading(true);

    try {
      await updatePassword(user, data.newPassword);
      toast({
        title: toastSuccessTitle,
        description: toastSuccessDescription,
      });
      form.reset();
    } catch (error: any) {
      let description = error.message;
      if (error.code === "auth/requires-recent-login") {
        description = recentLoginErrorDescription;
      } else if (error.code === "auth/weak-password") {
        description = "كلمة المرور الجديدة ضعيفة جدًا. يرجى اختيار كلمة مرور أقوى.";
      }
      toast({
        title: toastErrorTitle,
        description: description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{newPasswordLabel}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{confirmPasswordLabel}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormDescription>
              إذا طلب منك تسجيل دخول حديث ولم تنجح العملية، قم بتسجيل الخروج ثم الدخول مرة أخرى.
            </FormDescription>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? savingButtonText : saveButtonText}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
