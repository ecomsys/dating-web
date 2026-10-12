// app/(auth)/verify-email/page.tsx
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import { AxiosError } from 'axios';

import { ButtonLink } from '@/components/ui/button-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MailCheck, Loader2, Mail, AlertCircle } from 'lucide-react';

// Утилита для перехода в почту (повторяем логику)
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

export function VerifyEmailForm() {
  const { user, logout } = useAuthStore();
  const currentEmail = user?.email || '';

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [loadingResend, setLoadingResend] = useState(false);
  const [loadingChange, setLoadingChange] = useState(false);
  const [resendStatus, setResendStatus] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const emailProviderUrl = getEmailProviderUrl(currentEmail);

  const sendVerification = async () => {
    if (loadingResend) return;
    setLoadingResend(true);
    setResendStatus(false);
    
    try {
      const res = await api.post<{ success: boolean; redirect?: string }>('/email/resend');
      if (res.data.redirect) {
        window.location.href = res.data.redirect;
      } else if (res.data.success) {
        setResendStatus(true);
      }
    } catch (error) {
      console.error('Network error', error);
    } finally {
      setLoadingResend(false);
    }
  };

  const changeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingChange) return;
    setLoadingChange(true);
    setErrors({});

    try {
      const res = await api.post<{ success: boolean; email: string }>('/email/change', {
        email: newEmail,
      });
      
      if (res.data.success) {
        // Обновляем email в локальном стейте (чтобы ссылка "Перейти в почту" сразу обновилась)
        useAuthStore.setState({ user: { ...user!, email: res.data.email } });
        setShowEmailForm(false);
        setNewEmail('');
        setResendStatus(true); // Показываем сообщение об успешной отправке
      }
    } catch (error) {
      const err = error as AxiosError<{ errors: Record<string, string[]> }>;
      if (err.response?.status === 422 && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ email: ['Ошибка сервера. Попробуйте позже.'] });
      }
    } finally {
      setLoadingChange(false);
    }
  };

  return (
    <section className="w-full">
      
      {/* Верхний блок (Плашка) */}
      <div className="bg-card text-card-foreground px-4">
        <div className="relative max-w-md mx-auto px-6 py-10 bg-card text-card-foreground flex items-center gap-4">
          <div className="hidden md:flex w-20 h-20 shrink-0 rounded-full bg-primary/10 items-center justify-center">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-2">Проверьте электронную почту</h1>
            <p className="text-sm text-muted-foreground">
              Для завершения регистрации, нажмите на ссылку в письме, которое мы отправили вам на:{' '}
              <span className="text-primary font-medium">{currentEmail}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="w-full max-w-md mx-auto py-10 px-4 bg-background text-foreground">
        
        {/* Кнопки действий */}
        <div className="max-w-[18rem] flex flex-col gap-3 mb-10 mx-auto">
          <Button 
            className="w-full" 
            onClick={() => window.open(emailProviderUrl, '_blank', 'noopener,noreferrer')}
          >
            Перейти в почту
          </Button>

          <Button
            variant="outline"
            onClick={sendVerification}
            disabled={loadingResend}
            className="w-full"
          >
            {loadingResend ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Обработка...
              </span>
            ) : (
              'Отправить письмо повторно'
            )}
          </Button>

          {resendStatus && (
            <div className="p-3 rounded-md bg-primary/10 border border-primary/20 text-primary text-sm text-center flex items-center gap-2 justify-center">
              <MailCheck className="w-4 h-4" />
              Новая ссылка для подтверждения отправлена на ваш email
            </div>
          )}
        </div>

        {/* Разделитель 1 */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Что делать, если я не получил письмо?</span>
          </div>
        </div>

        <div className="space-y-4 text-sm mb-8">
          <p className="text-muted-foreground">
            Проверьте папку Спам вашего почтового ящика, наше письмо могло по ошибке попасть туда. Если это так, пожалуйста, отметьте его как Не спам.
          </p>
        </div>

        {/* Разделитель 2 */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Указали неверный адрес?</span>
          </div>
        </div>

        {/* Блок смены почты */}
        <div className="max-w-[18rem] mx-auto">
          {!showEmailForm ? (
            <Button variant="outline" onClick={() => setShowEmailForm(true)} className="w-full">
              Изменить почту
            </Button>
          ) : (
            <form onSubmit={changeEmail} className="space-y-3">
              <div>
                <Label htmlFor="newEmail" className="text-xs text-muted-foreground">Новый адрес эл. почты</Label>
                <Input
                  id="newEmail"
                  type="email"
                  autoFocus
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="mt-1 block w-full"
                  placeholder="new@example.com"
                  required
                />
                {errors.email && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 text-destructive" />
                    <p className="text-xs text-destructive">{errors.email[0]}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loadingChange} className="flex-1">
                  {loadingChange ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Сохранить и отправить'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowEmailForm(false)} className="flex-1">
                  Отмена
                </Button>
              </div>
            </form>
          )}
          
          {/* Блок навигации: Онбординг и Выход */}
          <div className="flex flex-col items-center gap-3 mt-8">
            <ButtonLink href="/onboarding" variant="link" className="text-sm text-primary">
              Вернуться к загрузке фото
            </ButtonLink>
            
            <Button variant="link" onClick={logout} className="text-sm text-muted-foreground hover:text-destructive transition-colors">
              Выйти из аккаунта
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}