// components/providers/app-provider.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { Loader } from '../ui/loader';

// Добавили '/user', чтобы гости могли смотреть профили
const PUBLIC_ROUTES = ['/', '/register', '/login', '/reset-password', '/search', '/user'];
const ALLOWED_AUTH_ROUTES = ['/verify-email', '/onboarding'];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const { user, isInitialized, fetchUser } = useAuthStore();
  const { openLoginModal } = useUIStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // 1. СИНХРОННОЕ ВЫЧИСЛЕНИЕ РЕДИРЕКТА
  // Мы проверяем права доступа прямо во время рендера, до того как отрисуется запрещенная страница
  let redirectTo: string | null = null;

  if (isInitialized) {
        // Проверяем точное совпадение ИЛИ начало пути (для /user/slug)
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
    const isAllowedAuthRoute = ALLOWED_AUTH_ROUTES.some(r => pathname.startsWith(r));

    if (!user) {
      // Гость пытается зайти на закрытый роут
      if (!isPublicRoute) {
        redirectTo = '/';
      }
    } else {
      const isStaff = ['admin', 'moderator', 'support'].includes(user.role);
      
      // Приоритет 1: Онбординг
      if (!user.has_completed_onboarding && !isStaff && !isAllowedAuthRoute) {
        redirectTo = '/onboarding';
      } 
      // Приоритет 2: Верификация
      else if (user.has_completed_onboarding && !user.email_verified_at && !isStaff && !isAllowedAuthRoute) {
        redirectTo = '/verify-email';
      } 

      // Ситуация: Авторизованный юзер пытается зайти на /login или /register
      // (Проверяем строго эти два роута, чтобы не блокировать /user/slug)
      else if ((pathname === '/login' || pathname === '/register')) {
        if (user.has_completed_onboarding && user.email_verified_at) {
            redirectTo = '/';
        }
      }
    }
  }

  // 2. ВЫПОЛНЕНИЕ РЕДИРЕКТА (в useEffect)
  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
      
      // Если гость попытался зайти на закрытую страницу — открываем модалку логина
      if (redirectTo === '/' && !user) {
        setTimeout(() => openLoginModal(), 300);
      }
    }
  }, [redirectTo, router, user, openLoginModal]);

  // 3. УСЛОВИЯ РЕНДЕРА (Блокируем мелькание)
  // Пока не инициализировались ИЛИ нужен редирект — показываем лоадер, а не children!
  if (!isInitialized || redirectTo) {
    return <Loader className="h-screen" />;
  }

  return <>{children}</>;
}