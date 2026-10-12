// app/(onboarding)/page.tsx
import { Suspense } from 'react';
import { OnboardingClient } from './_components/onboarding-client';
import { Loader } from '@/components/ui/loader';

export const instant = false;

export default function OnboardingPage() {
  return (
    <Suspense fallback={<Loader className="min-h-[calc(100dvh-4rem)]" />}>
      <OnboardingClient />
    </Suspense>
  );
}