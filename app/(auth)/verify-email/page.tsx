// app/(auth)/register/page.tsx
// Это Server Component! Никакого 'use client' здесь нет.

import { Suspense } from 'react';
import { VerifyEmailForm } from './_components/verify-email-form';
import { Loader } from '@/components/ui/loader';
// Отключаем instant navigation для этого роута
export const instant = false;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader className="min-h-[calc(100dvh-4rem)]" />}>
      <VerifyEmailForm />
    </Suspense>
  );
}