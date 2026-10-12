// components/layout/onboarding-navigation.tsx
'use client';

import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { LogOut } from 'lucide-react';

export function OnboardingNavigation() {
  const { logout } = useAuthStore();

  return (
    <header className="sticky z-50 top-0 w-full border-b border-border/30 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">        
        <a href="/" className="flex items-center gap-2.5 group">
          <svg className="w-8 h-8 fill-current text-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors inline">
            Dating App
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeSwitcher />
          <Button variant="outline" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground hover:bg-accent/50">
            <LogOut className="w-4 h-4 mr-1.5" />
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
}