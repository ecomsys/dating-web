// app/(onboarding)/layout.tsx
export const instant = false;

import { OnboardingNavigation } from '@/components/layout/navigations/onboarding-navigation';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <OnboardingNavigation />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}