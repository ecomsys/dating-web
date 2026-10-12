// app/(auth)/register/page.tsx
// Это Server Component! Никакого 'use client' здесь нет.

import { Suspense } from 'react';
import { RegisterForm } from './_components/register-form';
import { Loader } from '@/components/ui/loader';

// Отключаем instant navigation для этого роута
export const instant = false;

export default function RegisterPage() {
  return (
    <Suspense fallback={<Loader className="min-h-[calc(100dvh-4rem)]" />}>
      <RegisterForm />
    </Suspense>
  );
}