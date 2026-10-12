// app/(auth)/register/page.tsx
// Это Server Component! Никакого 'use client' здесь нет.

import { Suspense } from 'react';
import { ResetPasswordForm } from './_components/reset-password-form';
import { Loader } from '@/components/ui/loader';

// Отключаем instant navigation для этого роута
export const instant = false;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader className="min-h-[calc(100dvh-4rem)]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}