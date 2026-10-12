// components/layout/auth-navigation.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ButtonLink } from '@/components/ui/button-link';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

export function AuthNavigation() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { openLoginModal } = useUIStore();

  const isRegisterPage = pathname === '/register';

  return (
    <header className="sticky z-50 top-0 w-full border-b border-border/30 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* ЛЕВАЯ ЧАСТЬ: Только Лого */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <svg className="w-8 h-8 fill-current text-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors inline">
              Dating App
            </span>
          </Link>

          {/* ПРАВАЯ ЧАСТЬ: Переключатель темы + Умная кнопка */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeSwitcher />

            {/* СИТУАЦИЯ 1: Юзер авторизован (verify-email, confirm-password) -> Показываем "Выйти" */}
            {user ? (
              <Button variant="outline" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground hover:bg-accent/50">
                <LogOut className="w-4 h-4 mr-1.5" />
                Выйти
              </Button>
            ) : (
              /* СИТУАЦИЯ 2: Гость на странице Регистрации -> Показываем "Войти" (Открывает модалку) */
              isRegisterPage ? (
                <Button variant="outline" size="sm" onClick={()=>openLoginModal()}>
                  Войти
                </Button>
              ) : (
                /* СИТУАЦИЯ 3: Гость на страницах Логина, Сброса пароля -> Показываем "Регистрация" */               
                <ButtonLink href="/register" variant="default" size="sm">
                  Регистрация
                </ButtonLink>
              )
            )}

          </div>
        </div>
      </div>
    </header>
  );
}