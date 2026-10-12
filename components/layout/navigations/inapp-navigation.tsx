// components/layout/inapp-navigation.tsx
'use client';

import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link'; // Наш новый чистый компонент
import { ThemeSwitcher } from '@/components/theme-switcher';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Heart, Search, MessageCircle, Layers, Wallet, Gem, Star, 
  User, Image as ImageIcon, Settings, CreditCard, Book, LifeBuoy, LogOut
} from 'lucide-react';

export function InAppNavigation() {
  const { user, logout } = useAuthStore();
  const { openBillingModal } = useUIStore();

  if (!user) return null;

  return (
    <header className="sticky z-50 top-0 w-full border-b border-border/30 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ЛЕВАЯ ЧАСТЬ: Лого + Навигация */}
          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center gap-2.5 group shrink-0">
              <svg className="w-8 h-8 fill-current text-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <span className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors inline hidden sm:inline">
                Dating App
              </span>
            </a>

            <nav className="hidden lg:flex items-center gap-2">
              <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                <Heart className="w-5 h-5" /> Знакомства
              </a>
              <a href="/search" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                <Search className="w-5 h-5" /> Поиск
              </a>
              <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                <MessageCircle className="w-5 h-5" /> Сообщения
              </a>
              <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                <Layers className="w-5 h-5" /> Подписки
              </a>
            </nav>
          </div>

          {/* ПРАВАЯ ЧАСТЬ */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeSwitcher />

            {/* ДЕСКТОПНЫЕ HOVER-КАРТОЧКИ (скрыты на мобилках) */}
            <div className="hidden lg:flex items-center gap-2 sm:gap-3">
              
              {/* 1. КОШЕЛЕК */}
              <HoverCard>
                {/* Убрали asChild, стилизуем триггер напрямую */}
                <HoverCardTrigger className="w-9 h-9 rounded-full bg-muted/50 text-foreground hover:bg-muted flex items-center justify-center transition-colors border border-border/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
                  <Wallet className="w-5 h-5" />
                </HoverCardTrigger>
                <HoverCardContent className="w-72 p-0">
                  <div className="p-4 flex items-start gap-3">
                    <div className="mt-1 w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Wallet className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">В вашем кошельке:</h4>
                      <p className="text-xl font-bold text-foreground mt-1">0 ед.</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <Button onClick={openBillingModal} className="w-full bg-green-600 hover:bg-green-700">
                      Пополнить кошелек
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>

              {/* 2. VIP СТАТУС */}
              <HoverCard>
                <HoverCardTrigger className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 flex items-center justify-center transition-colors border border-blue-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
                  <Gem className="w-5 h-5" />
                </HoverCardTrigger>
                <HoverCardContent className="w-72 p-0">
                  {user.has_active_vip ? (
                    <div className="p-4 flex items-start gap-3">
                      <div className="mt-1 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Gem className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">VIP активен</h4>
                        {user.vip_expires_at && <p className="text-xs text-muted-foreground mt-1">Действует до: {new Date(user.vip_expires_at).toLocaleDateString('ru-RU')}</p>}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 flex items-start gap-3">
                        <div className="mt-1 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Gem className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">Включить VIP статус</h4>
                          <p className="text-xs text-muted-foreground mt-1">Встань первым</p>
                        </div>
                      </div>
                      <div className="p-4 pt-0">
                        {/* Используем ButtonLink вместо <a> с классами */}
                        <ButtonLink href="/vip" variant="default" className="w-full bg-green-600 hover:bg-green-700">
                          <Gem className="w-4 h-4 mr-2" /> Включить VIP статус
                        </ButtonLink>
                      </div>
                    </>
                  )}
                </HoverCardContent>
              </HoverCard>

              {/* 3. ПРЕМИУМ ДОСТУП */}
              <HoverCard>
                <HoverCardTrigger className="w-9 h-9 rounded-full bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 flex items-center justify-center transition-colors border border-orange-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
                  <Star className="w-5 h-5" />
                </HoverCardTrigger>
                <HoverCardContent className="w-72 p-0">
                  {user.has_active_premium ? (
                    <div className="p-4 flex items-start gap-3">
                      <div className="mt-1 w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">Премиум активен</h4>
                        {user.premium_expires_at && <p className="text-xs text-muted-foreground mt-1">Действует до: {new Date(user.premium_expires_at).toLocaleDateString('ru-RU')}</p>}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 flex items-start gap-3">
                        <div className="mt-1 w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                          <Star className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">Включить Премиум доступ</h4>
                          <p className="text-xs text-muted-foreground mt-1">Знакомься без ограничений</p>
                        </div>
                      </div>
                      <div className="p-4 pt-0">
                        <ButtonLink href="/premium" variant="default" className="w-full bg-green-600 hover:bg-green-700">
                          <Star className="w-4 h-4 mr-2" /> Включить Премиум
                        </ButtonLink>
                      </div>
                    </>
                  )}
                </HoverCardContent>
              </HoverCard>

              {/* 4. ПРОФИЛЬ (Десктоп) */}
              <HoverCard>
                <HoverCardTrigger className="flex items-center gap-2 border border-border rounded-full py-1 pl-1 pr-3 hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium text-foreground">Профиль</span>
                </HoverCardTrigger>
                <HoverCardContent className="w-60 p-1.5">
                  <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm text-foreground transition-colors"><User className="w-4 h-4 text-muted-foreground" /> Мой профиль</a>
                  <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm text-foreground transition-colors"><ImageIcon className="w-4 h-4 text-muted-foreground" /> Загрузить фото</a>
                  <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm text-foreground transition-colors"><Settings className="w-4 h-4 text-muted-foreground" /> Настройки сайта</a>
                  <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm text-foreground transition-colors"><CreditCard className="w-4 h-4 text-muted-foreground" /> Подписки</a>
                  <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm text-foreground transition-colors"><Book className="w-4 h-4 text-muted-foreground" /> Дневник</a>
                  
                  <div className="border-t border-border/50 my-1"></div>
                  
                  <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm text-foreground transition-colors"><LifeBuoy className="w-4 h-4 text-muted-foreground" /> Помощь</a>
                  
                  <div className="border-t border-border/50 my-1"></div>
                  
                  <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 text-sm text-destructive transition-colors w-full">
                    <LogOut className="w-4 h-4" /> Выход
                  </button>
                </HoverCardContent>
              </HoverCard>
            </div>

            {/* БУРГЕР ДЛЯ МОБИЛОК И ПЛАНШЕТОВ (Скрывается на lg и выше) - Иконка Аватар */}
            <div className="lg:hidden">
              <Sheet>
                {/* Убрали asChild у SheetTrigger */}
                <SheetTrigger className="rounded-full border border-border transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="w-8 h-8 rounded-full">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </SheetTrigger>
                
                <SheetContent side="right" className="w-full sm:max-w-sm p-0">
                  <div className="flex flex-col h-full">
                    
                    <SheetHeader className="flex-shrink-0 border-b border-border pb-4">
                      <SheetTitle className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar_url} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto scrollbar-hidden">
                      
                      <div className="space-y-1">
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"><Heart className="w-5 h-5 text-muted-foreground" /> Знакомства</a>
                        <a href="/search" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"><Search className="w-5 h-5 text-muted-foreground" /> Поиск</a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"><MessageCircle className="w-5 h-5 text-muted-foreground" /> Сообщения</a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"><Layers className="w-5 h-5 text-muted-foreground" /> Подписки</a>
                      </div>

                      <div className="border-t border-border"></div>

                      <div className="space-y-1">
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"><Wallet className="w-5 h-5 text-muted-foreground" /> Кошелек</a>
                        <ButtonLink href="/vip" variant="link" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-blue-500 hover:bg-blue-500/10 transition-colors w-full justify-start">
                          <Gem className="w-5 h-5" /> Включить VIP статус
                        </ButtonLink>
                        <ButtonLink href="/premium" variant="link" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-orange-500 hover:bg-orange-500/10 transition-colors w-full justify-start">
                          <Star className="w-5 h-5" /> Включить Премиум
                        </ButtonLink>
                      </div>

                      <div className="border-t border-border"></div>

                      <div className="space-y-1">
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"><User className="w-5 h-5 text-muted-foreground" /> Мой профиль</a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"><ImageIcon className="w-5 h-5 text-muted-foreground" /> Загрузить фото</a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"><Settings className="w-5 h-5 text-muted-foreground" /> Настройки сайта</a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"><Book className="w-5 h-5 text-muted-foreground" /> Дневник</a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"><LifeBuoy className="w-5 h-5 text-muted-foreground" /> Помощь</a>
                      </div>
                    </div>

                    <SheetFooter className="flex-shrink-0 border-t border-border pt-4 px-4 pb-8">
                      <Button onClick={logout} variant="outline" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                        <LogOut className="w-5 h-5" /> Выход
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