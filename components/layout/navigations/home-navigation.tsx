// components/layout/home-navigation.tsx
'use client';

import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger
} from '@/components/ui/sheet';
import { Heart, LayoutGrid, BookOpen, Menu } from 'lucide-react';
import Link from 'next/link';

export function HomeNavigation() {
  const { openLoginModal, openRegisterModal } = useUIStore();

  return (
    <header className="sticky z-50 top-0 w-full border-b border-border/30 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* ЛЕВАЯ ЧАСТЬ: Лого + Навигация (Десктоп) */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <svg className="w-8 h-8 fill-current text-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <span className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors inline">
                Dating App
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-2">
              <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                <Heart className="w-5 h-5" />
                Знакомства
              </a>
              <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                <LayoutGrid className="w-5 h-5" />
                Доска объявлений
              </a>
              <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                <BookOpen className="w-5 h-5" />
                Блог
              </a>
            </nav>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: Только для гостей */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            <ThemeSwitcher />

            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:inline-flex"
              onClick={()=>openLoginModal()}
            >
              Войти
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              className="hidden sm:inline-flex"
              onClick={()=>openRegisterModal()}
            >
              Регистрация
            </Button>

            {/* БУРГЕР ДЛЯ МОБИЛОК И ПЛАНШЕТОВ (Скрывается на lg и выше) */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">                
                    <Menu className="w-6 h-6" />                
                </SheetTrigger>
                
                <SheetContent side="right" className="w-full sm:max-w-sm p-0">
                  <div className="flex flex-col h-full">
                    
                    <SheetHeader className="flex-shrink-0 border-b border-border pb-4">
                      <SheetTitle className="flex items-center gap-2">
                        <svg className="w-6 h-6 fill-current text-foreground" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        Dating App
                      </SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hidden">
                      <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-foreground hover:bg-accent/50 transition-colors">
                        <Heart className="w-5 h-5 text-muted-foreground" />
                        Знакомства
                      </a>
                      <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-foreground hover:bg-accent/50 transition-colors">
                        <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                        Доска объявлений
                      </a>
                      <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-foreground hover:bg-accent/50 transition-colors">
                        <BookOpen className="w-5 h-5 text-muted-foreground" />
                        Блог
                      </a>
                    </div>

                    <SheetFooter className="flex-shrink-0 border-t border-border pt-4 px-4 pb-8 space-y-3 flex flex-col items-stretch">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={()=>openLoginModal()}
                      >
                        Войти
                      </Button>
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={()=>openRegisterModal()}
                      >
                        Регистрация
                      </Button>
                    </SheetFooter>

                  </div>
                </SheetContent>
              </Sheet>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}