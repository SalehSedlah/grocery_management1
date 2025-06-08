
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";

const updateProfileFormSchema = z.object({
  displayName: z.string().min(2, { message: "يجب أن يتكون الاسم المعروض من حرفين على الأقل." }).max(50),
  businessName: z.string().min(2, { message: "يجب أن يتكون اسم البقالة من حرفين على الأقل." }).max(50),
});

type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;

export function UpdateProfileForm() {
  const { user, businessName, setBusinessNameInContext } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const displayNameLabel = "الاسم المعروض";
  const businessNameLabel = "اسم البقالة / النشاط التجاري";
  const saveButtonText = "حفظ التغييرات";
  const savingButtonText = "جاري الحفظ...";
  const toastSuccessTitle = "تم تحديث الملف الشخصي";
  const toastSuccessDescription = "تم حفظ تغييرات ملفك الشخصي بنجاح.";
  const toastErrorTitle = "خطأ في التحديث";


  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      businessName: businessName || "",
    },
  });

  useEffect(() => {
    if (user || businessName) {
      form.reset({
        displayName: user?.displayName || "",
        businessName: businessName || "",
      });
    }
  }, [user, businessName, form]);

  async function onSubmit(data: UpdateProfileFormValues) {
    if (!user) return;
    setLoading(true);
    try {
      // Update display name in Firebase Auth
      if (data.displayName !== user.displayName) {
        await updateProfile(user, { displayName: data.displayName });
      }

      // Update business name in context and localStorage
      if (data.businessName !== businessName) {
        setBusinessNameInContext(data.businessName);
      }
      
      toast({
        title: toastSuccessTitle,
        description: toastSuccessDescription,
      });
    } catch (error: any) {
      toast({
        title: toastErrorTitle,
        description: error.message,
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
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{displayNameLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder="اسمك الذي يظهر للآخرين" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{businessNameLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم بقالتك أو نشاطك التجاري" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? savingButtonText : saveButtonText}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
