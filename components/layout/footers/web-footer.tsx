// components/layout/web-footer.tsx
'use client';

import { useAuthStore } from '@/store/auth-store';
import { LifeBuoy, FileText, Mail } from 'lucide-react';

export function WebFooter() {
  const { user } = useAuthStore();

  // Компактный футер для авторизованных
  if (user) {
    return (
      <footer className="border-t border-border/30 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Dating App. Все права защищены.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Помощь</a>
            <a href="#" className="hover:text-foreground transition-colors">Условия</a>
            <a href="#" className="hover:text-foreground transition-colors">Конфиденциальность</a>
          </div>
        </div>
      </footer>
    );
  }

  // Большой футер для гостей
  return (
    <footer className="border-t border-border/30 mt-auto bg-background/50">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">О нас</h4>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Сайт знакомств для серьезных отношений. Найди свою любовь уже сегодня!
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Помощь</h4>
          <ul className="space-y-1 text-muted-foreground text-xs">
            <li><a href="#" className="hover:text-primary flex items-center gap-1"><LifeBuoy className="w-3 h-3" /> Служба поддержки</a></li>
            <li><a href="#" className="hover:text-primary">Часто задаваемые вопросы</a></li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Документы</h4>
          <ul className="space-y-1 text-muted-foreground text-xs">
            <li><a href="#" className="hover:text-primary flex items-center gap-1"><FileText className="w-3 h-3" /> Пользовательское соглашение</a></li>
            <li><a href="#" className="hover:text-primary">Политика конфиденциальности</a></li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Контакты</h4>
          <ul className="space-y-1 text-muted-foreground text-xs">
            <li><a href="#" className="hover:text-primary flex items-center gap-1"><Mail className="w-3 h-3" /> support@datingapp.ru</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/30">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dating App. ИТ-деятельность.
        </div>
      </div>
    </footer>
  );
}