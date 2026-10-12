// components/layout/web-navigation.tsx
'use client';

import { useAuthStore } from '@/store/auth-store';
import { HomeNavigation } from './home-navigation';
import { InAppNavigation } from './inapp-navigation'; // Заглушка, создадим в следующем шаге

export function WebNavigation() {
  const { user } = useAuthStore();

  // Если юзер авторизован — показываем сложную шапку с кошельком/VIP/Профилем
  if (user) {
    return <InAppNavigation />;
  }

  // Если гость — показываем простую шапку с кнопками Войти/Регистрация
  return <HomeNavigation />;
}