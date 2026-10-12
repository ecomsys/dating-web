// app/(auth)/reset-password/page.tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrors({});

    try {
      const res = await api.post<{ success: boolean; redirect: string }>('/reset-password', {
        token: searchParams.get('token'),
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (res.data.success) {
        // Бэк возвращает редирект на /?login=1
        window.location.href = res.data.redirect;
      }
    } catch (error) {
      const err = error as AxiosError<{ errors: Record<string, string[]> }>;
      if (err.response?.status === 422 && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ email: ['Ошибка сервера. Попробуйте снова.'] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-background text-foreground min-h-[calc(100dvh-4rem)] flex flex-col justify-center">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-semibold">Создать новый пароль</h1>
        <p className="text-sm text-muted-foreground mt-1">Установите новый пароль для вашей учетной записи</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Почта</Label>
          <Input
            id="email"
            type="email"
            required
            readOnly
            value={email}
            className="w-full bg-muted/50 border-border cursor-not-allowed opacity-75"
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">Новый пароль</Label>
          <Input
            id="password"
            type="password"
            required
            autoFocus
            autoComplete="new-password"
            placeholder="Введите новый пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password_confirmation" className="text-sm font-medium text-muted-foreground">Подтверждение пароля</Label>
          <Input
            id="password_confirmation"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Подтвердите ваш пароль"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
          {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation[0]}</p>}
        </div>

        <Button type="submit" disabled={loading} className="w-full py-3">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Обработка...
            </span>
          ) : (
            'Сбросить пароль'
          )}
        </Button>
      </form>
    </div>
  );
}
