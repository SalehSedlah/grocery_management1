
"use client";

import { UpdateProfileForm } from "@/components/settings/update-profile-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const pageTitle = "إدارة الحساب";
  const pageDescription = "قم بتحديث معلومات ملفك الشخصي وإعدادات الأمان.";
  const profileSettingsTitle = "إعدادات الملف الشخصي";
  const passwordSettingsTitle = "تغيير كلمة المرور";

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-headline font-semibold text-foreground">{pageTitle}</h1>
        <p className="text-muted-foreground">{pageDescription}</p>
      </div>

      <section aria-labelledby="profile-settings-title">
        <h2 id="profile-settings-title" className="text-xl font-semibold text-foreground mb-4">{profileSettingsTitle}</h2>
        <UpdateProfileForm />
      </section>

      <Separator />

      <section aria-labelledby="password-settings-title">
        <h2 id="password-settings-title" className="text-xl font-semibold text-foreground mb-4">{passwordSettingsTitle}</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
