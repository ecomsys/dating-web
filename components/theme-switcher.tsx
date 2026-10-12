// components/theme-switcher.tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useState } from 'react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    // 1. Меняем тему мгновенно на фронте (UI летает быстро)
    setTheme(newTheme);

    // 2. Если юзер залогинен, сохраняем в БД
    if (user) {
      setIsSaving(true);
      try {
        await api.post('/settings/theme', { theme: newTheme });
      } catch (error) {
        console.error('Ошибка сохранения темы:', error);
      } finally {
        setIsSaving(false);
      }
    }
    // Если гость, next-themes сам положил куку "theme"
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      disabled={isSaving}
      className="rounded-full"
      aria-label="Переключить тему"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}