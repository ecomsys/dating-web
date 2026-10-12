// app/(auth)/layout.tsx
export const instant = false;

import { AuthNavigation } from '@/components/layout/navigations/auth-navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AuthNavigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}