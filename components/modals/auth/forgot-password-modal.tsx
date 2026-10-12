// components/modals/auth/forgot-password-modal.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUIStore } from '@/store/ui-store';
import api from '@/lib/api';
import { AxiosError } from 'axios';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Key, MailCheck, RefreshCw, Loader2 } from 'lucide-react';

interface ValidationErrors {
  email?: string[];
  captchaInput?: string[];
}

// Утилита для определения провайдера почты (аналог getEmailProviderUrl из Alpine)
const getEmailProviderUrl = (email: string): string => {
  if (!email) return '#';
  const domain = email.split('@')[1];
  if (!domain) return '#';

  const providers: Record<string, string> = {
    'gmail.com': 'https://mail.google.com',
    'googlemail.com': 'https://mail.google.com',
    'mail.ru': 'https://e.mail.ru/inbox',
    'inbox.ru': 'https://e.mail.ru/inbox',
    'list.ru': 'https://e.mail.ru/inbox',
    'bk.ru': 'https://e.mail.ru/inbox',
    'yandex.ru': 'https://mail.yandex.ru',
    'yandex.by': 'https://mail.yandex.ru',
    'ya.ru': 'https://mail.yandex.ru',
    'outlook.com': 'https://outlook.live.com/mail/0/inbox',
    'hotmail.com': 'https://outlook.live.com/mail/0/inbox',
    'live.com': 'https://outlook.live.com/mail/0/inbox',
    'icloud.com': 'https://www.icloud.com/mail',
    'rambler.ru': 'https://mail.rambler.ru/',
  };

  return providers[domain] || `https://${domain}`;
};

// 1. Выносим форму в отдельный компонент для чистоты стейта
function ForgotPasswordForm() {
  const { prefillEmail, closeForgotPasswordModal, openLoginModal, openRegisterModal } = useUIStore();

  const [email, setEmail] = useState(prefillEmail || '');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // Стейты для второго экрана
  const [emailSent, setEmailSent] = useState(false);
  const [emailProviderUrl, setEmailProviderUrl] = useState('#');

  const fetchCaptcha = useCallback(async () => {
    try {
      const res = await api.get<{ image: string }>('/captcha/forgot');
      setCaptchaImage(res.data.image);
    } catch (error) {
      console.error('Ошибка загрузки капчи', error);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(()=>fetchCaptcha());
  }, [fetchCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setErrors({});

    try {
      const res = await api.post<{ success: boolean }>('/forgot-password', {
        email,
        captchaInput,
      });

      if (res.data.success) {
        // Переходим на экран "Письмо отправлено"
        setEmailSent(true);
        setEmailProviderUrl(getEmailProviderUrl(email));
      }
    } catch (error) {
      const err = error as AxiosError<{ errors: ValidationErrors }>;
      if (err.response && err.response.status === 422 && err.response.data.errors) {
        setErrors(err.response.data.errors);
        if (err.response.data.errors.email || err.response.data.errors.captchaInput) {
          fetchCaptcha();
          setCaptchaInput('');
        }
      } else {
        setErrors({ email: ['Ошибка сервера. Обновите страницу.'] });
      }
    } finally {
      setLoading(false);
    }
  };

  // ЭКРАН 1: Письмо отправлено
  if (emailSent) {
    return (
      <div className="relative p-6 pt-12 text-center flex flex-col items-center gap-3">
        <div className="absolute top-3 right-3">
          <Button variant="ghost" size="icon-sm" onClick={closeForgotPasswordModal}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <MailCheck className="w-8 h-8 text-green-500" />
        </div>
        
        <h4 className="text-lg font-semibold text-foreground">Письмо отправлено!</h4>
        
        <p className="text-sm text-muted-foreground max-w-[20rem]">
          Ссылка для сброса пароля отправлена на:<br />
          <strong className="text-foreground">{email}</strong>
        </p>
        
        <div className="w-full max-w-xs space-y-2 mt-2 mx-auto">
          <Button 
            className="w-full" 
            onClick={() => window.open(emailProviderUrl, '_blank', 'noopener,noreferrer')}
          >
            Перейти в почту
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => { closeForgotPasswordModal(); openLoginModal(email); }}
          >
            Вернуться ко входу
          </Button>
        </div>
      </div>
    );
  }

  // ЭКРАН 2: Форма восстановления
  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-xl font-semibold flex items-center gap-3">                
          Восстановление пароля
          <Key className="w-5 h-5 text-yellow-500" />
        </h3>        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="font-medium text-foreground text-sm">Восстановить по почте</p>
            <p className="text-xs text-muted-foreground">На ваш почтовый ящик придет информация о вашем аккаунте.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email">Ваш Email</Label>
              <Input
                id="forgot-email"
                type="email"
                autoFocus
                autoComplete="email"
                placeholder="Введите ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email[0]}</p>}
            </div>

            <div className="space-y-1.5 pt-2">
              <Label>Символы на картинке</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 h-10 rounded border border-border bg-[#dcdee4] overflow-hidden flex items-center justify-center">
                    {captchaImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={captchaImage} alt="Captcha" className="absolute inset-0 w-full h-full object-contain" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-muted-foreground/50 animate-spin" />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-10 w-10"
                    onClick={() => { fetchCaptcha(); setCaptchaInput(''); }}
                    title="Обновить картинку"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
                  </Button>
                </div>
                <Input
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Введите код"
                  className="w-full"
                />
              </div>
              {errors.captchaInput && <p className="text-xs text-destructive mt-1">{errors.captchaInput[0]}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Отправка...
                </span>
              ) : (
                'Восстановить'
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button 
              type="button"
              variant="link"
              className="text-xs text-primary"
              onClick={() => { closeForgotPasswordModal(); openLoginModal(email); }}
            >
              Я вспомнил пароль. Вернуться ко входу
            </Button>
          </div>
        </div>

        {/* Правая колонка (промо регистрации) */}
        <div className="bg-muted/30 border-t border-border md:border-t-0 md:border-l p-6 text-center space-y-2 flex flex-col">
          <h4 className="font-semibold text-lg">У вас ещё нет анкеты?</h4>
          <p className="text-sm text-muted-foreground">
            Вы найдете множество интересных людей из вашего города. Начните общаться прямо сейчас.
          </p>
          <p className="text-xs text-muted-foreground pb-2">Регистрация займет меньше минуты.</p>
          <Button variant="default" onClick={openRegisterModal}>
            Регистрация
          </Button>
        </div>
      </div>
    </div>
  );
}

// 2. Обертка модалки
export function ForgotPasswordModal() {
  const { isForgotPasswordModalOpen, closeForgotPasswordModal } = useUIStore();

  // Авто-открытие, если в URL есть ?forgot=1
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('forgot')) {
        useUIStore.getState().openForgotPasswordModal();
      }
    }
  }, []);

  return (
    <Dialog open={isForgotPasswordModalOpen} onOpenChange={(open) => !open && closeForgotPasswordModal()}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <ForgotPasswordForm />
      </DialogContent>
    </Dialog>
  );
}