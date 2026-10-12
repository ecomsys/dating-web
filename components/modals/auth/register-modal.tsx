// components/modals/auth/register-modal.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui-store';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { X } from 'lucide-react';

// Генерируем данные для селектов на клиенте (аналог из Blade)
const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
const YEARS = Array.from({ length: 61 }, (_, i) => (2010 - i).toString()); // От 2010 до 1950

function RegisterForm() {
  const router = useRouter();
  const { closeRegisterModal, openLoginModal } = useUIStore();

  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');

  // Валидация даты (проверяем, что дата реальная, например, нет 31 февраля)
  const isDateValid = useMemo(() => {
    if (!birthDay || !birthMonth || !birthYear) return false;
    const d = new Date(Number(birthYear), Number(birthMonth) - 1, Number(birthDay));
    return (
      d.getFullYear() === Number(birthYear) &&
      (d.getMonth() + 1) === Number(birthMonth) &&
      d.getDate() === Number(birthDay)
    );
  }, [birthDay, birthMonth, birthYear]);

  const isFormValid = name.trim() !== '' && gender !== '' && isDateValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Собираем параметры для передачи на страницу регистрации
    const params = new URLSearchParams();
    params.append('name', name);
    params.append('gender', gender);
    params.append('birth_day', birthDay);
    params.append('birth_month', birthMonth);
    params.append('birth_year', birthYear);

    // Закрываем модалку и переходим на страницу
    closeRegisterModal();
    router.push(`/register?${params.toString()}`);
  };

  // Показывать ошибку, если выбрана вся дата, но она невалидна
  const showDateError = birthDay && birthMonth && birthYear && !isDateValid;

  return (
    <div className="px-6 pb-6 pt-3">
      <form className="space-y-4" onSubmit={handleSubmit}>
        
        {/* Имя */}
        <div className="space-y-2">
          <Label htmlFor="reg-name" className="text-sm font-medium text-muted-foreground">
            Ваше имя
          </Label>
          <Input
            id="reg-name"
            type="text"
            required
            placeholder="Например, Анна"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Пол */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Кого вы ищете?
          </Label>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                gender === 'male' ? 'border-primary bg-primary/10 shadow-sm' : 'border-border hover:bg-accent hover:border-muted-foreground/20'
              }`}
            >
              {/* Иконка мужчины (заглушка SVG) */}
              <svg className="h-12 w-12 sm:h-14 sm:w-14 transition-colors duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="6" r="4" />
                <path d="M12 10v10M8 14h8" />
              </svg>
              <span className={`text-sm font-medium transition-colors duration-200 ${gender === 'male' ? 'text-primary' : 'text-foreground'}`}>
                Парня
              </span>
            </button>

            <button
              type="button"
              onClick={() => setGender('female')}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                gender === 'female' ? 'border-primary bg-primary/10 shadow-sm' : 'border-border hover:bg-accent hover:border-muted-foreground/20'
              }`}
            >
              {/* Иконка женщины (заглушка SVG) */}
              <svg className="h-12 w-12 transition-colors duration-200 sm:h-14 sm:w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="6" r="4" />
                <path d="M8 10l-2 10h12l-2-10" />
              </svg>
              <span className={`text-sm font-medium transition-colors duration-200 ${gender === 'female' ? 'text-primary' : 'text-foreground'}`}>
                Девушку
              </span>
            </button>
          </div>
        </div>

        {/* Дата рождения */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Дата рождения
          </Label>
          <div className="grid w-full grid-cols-3 gap-2">
           {/* День */}
            <Select value={birthDay} onValueChange={(val) => setBirthDay(val ?? '')}>
            <SelectTrigger className="w-full bg-input border-border">
                <SelectValue placeholder="День" />
            </SelectTrigger>
            <SelectContent side="top" align="end" className="max-h-[24rem] overflow-y-auto">
                {DAYS.map((day) => (
                <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
            </SelectContent>
            </Select>

            {/* Месяц */}                       
            <Select value={birthMonth} onValueChange={(val) => setBirthMonth(val ?? '')}>
              <SelectTrigger className="w-full bg-input border-border">
                <SelectValue placeholder="Месяц">
                  {/* Вычисляем название месяца по индексу */}
                  {birthMonth ? MONTHS[parseInt(birthMonth) - 1] : "Месяц"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="top" align="end" className="max-h-[24rem] overflow-y-auto">
                {MONTHS.map((month, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Год */}
            <Select value={birthYear} onValueChange={(val) => setBirthYear(val ?? '')}>
            <SelectTrigger className="w-full bg-input border-border">
                <SelectValue placeholder="Год" />
            </SelectTrigger>
            <SelectContent side="top" align="end" className="max-h-[24rem] overflow-y-auto">
                {YEARS.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
            </SelectContent>
            </Select>
          </div>
          {showDateError && (
            <p className="text-sm text-destructive">
              Такой даты не существует. Проверьте месяц и день.
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={!isFormValid}>
          Далее
        </Button>
        
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed pt-1">
          Регистрируясь, вы принимаете условия{' '}
          <a href="#" className="text-primary hover:underline">пользовательского соглашения</a>{' '}
          и даете согласие на обработку персональных данных
        </p>
      </form>

      <div className="text-center mt-4 border-t border-border pt-4">
        <Button 
          variant="link" 
          className="text-xs text-primary"
          onClick={() => { closeRegisterModal(); openLoginModal(); }}
        >
          У меня уже есть аккаунт. Войти
        </Button>
      </div>
    </div>
  );
}

export function RegisterModal() {
  const { isRegisterModalOpen, closeRegisterModal } = useUIStore();

  return (
    <Dialog open={isRegisterModalOpen} onOpenChange={(open) => !open && closeRegisterModal()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b border-border space-y-0">
          <DialogTitle className="text-xl font-semibold">Создайте анкету</DialogTitle>         
        </DialogHeader>
        
        <RegisterForm />
      </DialogContent>
    </Dialog>
  );
}