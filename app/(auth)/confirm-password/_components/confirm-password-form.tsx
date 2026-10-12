// app/(auth)/confirm-password/page.tsx
'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export function ConfirmPasswordForm() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrors({});

    try {
      const res = await api.post<{ success: boolean; redirect: string }>('/confirm-password', {
        password,
      });

      if (res.data.success) {
        // Редирект на intended URL (куда юзер изначально хотел попасть)
        window.location.href = res.data.redirect;
      }
    } catch (error) {
      const err = error as AxiosError<{ errors: Record<string, string[]> }>;
      if (err.response?.status === 422 && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ password: ['Ошибка сервера. Попробуйте снова.'] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-background text-foreground min-h-[calc(100dvh-4rem)] flex flex-col justify-center">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-semibold">Подтверждение пароля</h1>
        <p className="text-sm text-muted-foreground mt-1">Пожалуйста, подтвердите ваш пароль перед продолжением</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">Пароль</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password[0]}</p>}
        </div>

        <Button type="submit" disabled={loading} className="w-full py-3">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Обработка...
            </span>
          ) : (
            'Подтвердить'
          )}
        </Button>
      </form>
    </div>
  );
}