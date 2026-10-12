// app/(auth)/register/page.tsx
// Это Server Component! Никакого 'use client' здесь нет.

import { Suspense } from 'react';
import { ConfirmPasswordForm } from './_components/confirm-password-form';
import { Loader } from '@/components/ui/loader';

// Отключаем instant navigation для этого роута
export const instant = false;


export default function ConfirmPasswordPage() {
  return (
    <Suspense fallback={<Loader className="min-h-[calc(100dvh-4rem)]" />}>
      <ConfirmPasswordForm />
    </Suspense>
  );
}