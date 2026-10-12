// app/(web)/layout.tsx
import { WebNavigation } from '@/components/layout/navigations/web-navigation';
import { WebFooter } from '@/components/layout/footers/web-footer';
import { BoostBar } from '@/components/layout/other/boost-bar';

// Глобальные модалки
import { LoginModal } from '@/components/modals/auth/login-modal';
import { ForgotPasswordModal } from '@/components/modals/auth/forgot-password-modal';
import { RegisterModal } from '@/components/modals/auth/register-modal';

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-foreground">
      
      {/* 1. ШАПКА (Динамическая: Гость / Авторизованный) */}
      <WebNavigation />

      {/* 2. ЛЕНТА БУСТОВ (Горизонтальная плашка под шапкой) */}
      <BoostBar />

      {/* 3. ОСНОВНОЙ КОНТЕНТ (Две колонки: Сайдбар + Контент) */}
      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">

          {/* ЛЕВАЯ КОЛОНКА (Сайдбар) - пока скрыт, позже добавим компоненты фильтров */}
          <aside className="w-full md:w-64 shrink-0 hidden md:block">
            <div className="space-y-4">
              {/* Сюда потом положим фильтры поиска */}
              <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground">
                Фильтры поиска (скоро)
              </div>
            </div>
          </aside>

          {/* ПРАВАЯ КОЛОНКА (Динамический контент: Лента, Профиль, Дневники) */}
          <div className="flex-1 min-w-0">
            {children}
          </div>

        </div>
      </main>

      {/* 4. ФУТЕР (Динамический: Гость / Авторизованный) */}
      <WebFooter />

      {/* 5. ГЛОБАЛЬНЫЕ МОДАЛКИ ДЛЯ ЭТОГО ЛЕЯУТА */}
      <LoginModal />
      <ForgotPasswordModal />
      <RegisterModal />
      
    </div>
  );
}