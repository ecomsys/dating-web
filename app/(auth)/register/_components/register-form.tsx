// app/(auth)/register/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { AxiosError } from "axios";

import { CityCombobox } from '@/components/ui/city-combobox';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2, RefreshCw } from "lucide-react";

import { SocialAuthVertical } from "@/components/social-auth-vertical";

type Gender = "male" | "female" | "";
type Goal = "friends" | "romantic" | "family" | "casual" | "travel";

const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];
const YEARS = Array.from({ length: 61 }, (_, i) => (2010 - i).toString());

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaImage, setCaptchaImage] = useState("");

  const [form, setForm] = useState({
    name: "",
    gender: "" as Gender,
    birth_day: "",
    birth_month: "",
    birth_year: "",
    dating_goals: [] as Goal[],
    city_id: "", // <--- Заменили
    country_id: "", // <--- Добавили
    city_label: "", // <--- Добавили
    email: "",
    password: "",
    captchaInput: "",
  });

  // Валидация даты на клиенте (чтобы не слать лишний раз на бэк)
  const isDateValid = useMemo(() => {
    if (!form.birth_day || !form.birth_month || !form.birth_year) return false;
    const d = new Date(
      Number(form.birth_year),
      Number(form.birth_month) - 1,
      Number(form.birth_day),
    );
    return (
      d.getFullYear() === Number(form.birth_year) &&
      d.getMonth() + 1 === Number(form.birth_month) &&
      d.getDate() === Number(form.birth_day)
    );
  }, [form.birth_day, form.birth_month, form.birth_year]);

  // Префилл из URL (от модалки)
  useEffect(() => {
    const foo = () => {
      setForm((prev) => ({
        ...prev,
        name: searchParams.get("name") || "",
        gender: (searchParams.get("gender") as Gender) || "",
        birth_day: searchParams.get("birth_day") || "",
        birth_month: searchParams.get("birth_month") || "",
        birth_year: searchParams.get("birth_year") || "",
      }));
    };
    foo();
  }, [searchParams]);

  const fetchCaptcha = useCallback(async () => {
    setLoadingCaptcha(true);
    try {
      const res = await api.post<{ captchaImage: string }>("/register/captcha");
      if (res.data.captchaImage) {
        setCaptchaImage(res.data.captchaImage);
        setForm((prev) => ({ ...prev, captchaInput: "" }));
      }
    } catch (e) {
      console.error("Captcha refresh error", e);
    } finally {
      setLoadingCaptcha(false);
    }
  }, []);

  const toggleGoal = (goal: Goal) => {
    setForm((prev) => ({
      ...prev,
      dating_goals: prev.dating_goals.includes(goal)
        ? prev.dating_goals.filter((g) => g !== goal)
        : [...prev.dating_goals, goal],
    }));
  };

  // Универсальный метод отправки на бэк
  const sendRequest = async (
    url: string,
    payload: Record<string, unknown>,
    onSuccess: (data: any) => void,
  ) => {
    setLoading(true);
    setErrors({});

    try {
      const res = await api.post(url, payload);
      if (res.data) {
        onSuccess(res.data);
      }
    } catch (error) {
      const err = error as AxiosError<{
        errors: Record<string, string[]>;
        captchaImage?: string;
      }>;
      if (err.response?.status === 422 && err.response.data.errors) {
        const formatted: Record<string, string> = {};
        for (const key in err.response.data.errors) {
          formatted[key] = err.response.data.errors[key][0];
        }
        setErrors(formatted);

        // Если бэк вернул новую капчу (при ошибке ввода)
        if (err.response.data.captchaImage) {
          setCaptchaImage(err.response.data.captchaImage);
          setForm((prev) => ({ ...prev, captchaInput: "" }));
        }
      } else {
        setErrors({ general: "Ошибка сервера. Попробуйте еще раз." });
      }
    } finally {
      setLoading(false);
    }
  };

  const submitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    sendRequest("/register/step1", { ...form }, () => setStep(2));
  };

  const submitStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    sendRequest(
      "/register/step2",
      { dating_goals: form.dating_goals },
      (data) => {
        if (data.captchaImage) setCaptchaImage(data.captchaImage);
        setStep(3);
      },
    );
  };

  const submitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    sendRequest("/register", { ...form }, (data) => {
      if (data.redirect) {
        // Меняем router.push на window.location.href
        window.location.href = data.redirect; 
      }
    });
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-2xl items-center px-4 py-8 sm:px-6">
      <div className="flex w-full flex-col bg-background text-foreground lg:flex-row lg:items-stretch">
        {/* ЛЕВАЯ КОЛОНКА (форма) */}
        <div className="mx-auto flex w-full max-w-md flex-col justify-center lg:mx-0 lg:max-w-none lg:w-[448px] lg:flex-none lg:border-r lg:border-border lg:pr-8">
          {/* Прогресс-бар */}
          <div className="mx-auto mb-8 flex w-full max-w-[240px] flex-col items-center gap-2">
            <div className="flex w-full items-center gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? "bg-green-600" : "bg-muted"}`}
              ></div>
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? "bg-green-600" : "bg-muted"}`}
              ></div>
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 3 ? "bg-green-600" : "bg-muted"}`}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">Шаг {step} из 3</p>
          </div>

          <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">
            Регистрация
          </h1>

          {/* ЭТАП 1 */}
          {step === 1 && (
            <form onSubmit={submitStep1} className="w-full space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Имя
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="Введите ваше имя"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Ваш пол
                </Label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, gender: "male" })}
                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 outline-none transition-all duration-200 ${
                      form.gender === "male"
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:bg-accent hover:border-muted-foreground/20"
                    }`}
                  >
                    <svg
                      className="h-12 w-12 sm:h-14 sm:w-14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="6" r="4" />
                      <path d="M12 10v10M8 14h8" />
                    </svg>
                    <span
                      className={`text-sm font-medium ${form.gender === "male" ? "text-primary" : "text-foreground"}`}
                    >
                      Мужской
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, gender: "female" })}
                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 outline-none transition-all duration-200 ${
                      form.gender === "female"
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:bg-accent hover:border-muted-foreground/20"
                    }`}
                  >
                    <svg
                      className="h-12 w-12 sm:h-14 sm:w-14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="6" r="4" />
                      <path d="M8 10l-2 10h12l-2-10" />
                    </svg>
                    <span
                      className={`text-sm font-medium ${form.gender === "female" ? "text-primary" : "text-foreground"}`}
                    >
                      Женский
                    </span>
                  </button>
                </div>
                {errors.gender && (
                  <p className="text-sm text-destructive">{errors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  День рождения
                </Label>
                <div className="grid w-full grid-cols-3 gap-2">
                  <Select
                    value={form.birth_day}
                    onValueChange={(val) =>
                      setForm({ ...form, birth_day: val ?? "" })
                    }
                  >
                    <SelectTrigger className="w-full bg-input border-border">
                      <SelectValue placeholder="День" />
                    </SelectTrigger>
                    <SelectContent
                      side="top"
                      align="end"
                      className="max-h-[24rem] overflow-y-auto"
                    >
                      {DAYS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={form.birth_month}
                    onValueChange={(val) =>
                      setForm({ ...form, birth_month: val ?? "" })
                    }
                  >
                    <SelectTrigger className="w-full bg-input border-border">
                      <SelectValue placeholder="Месяц">
                        {/* Если месяц выбран, ищем его название по индексу, иначе показываем плейсхолдер */}
                        {form.birth_month 
                          ? MONTHS[parseInt(form.birth_month) - 1] 
                          : "Месяц"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      side="top"
                      align="end"
                      className="max-h-[24rem] overflow-y-auto"
                    >
                      {MONTHS.map((m, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={form.birth_year}
                    onValueChange={(val) =>
                      setForm({ ...form, birth_year: val ?? "" })
                    }
                  >
                    <SelectTrigger className="w-full bg-input border-border">
                      <SelectValue placeholder="Год" />
                    </SelectTrigger>
                    <SelectContent
                      side="top"
                      align="end"
                      className="max-h-[24rem] overflow-y-auto"
                    >
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.birth_day && (
                  <p className="text-sm text-destructive">{errors.birth_day}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !(form.name && form.gender && isDateValid)}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Далее"
                )}
              </Button>
            </form>
          )}

          {/* ЭТАП 2 */}
          {step === 2 && (
            <form onSubmit={submitStep2} className="w-full space-y-4">
              <h2 className="text-center text-lg font-medium text-muted-foreground">
                Цель знакомства
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 sm:gap-4">
                {(
                  [
                    {
                      key: "friends",
                      label: "Поиск друзей",
                      icon: "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z",
                    },
                    {
                      key: "family",
                      label: "Создание семьи",
                      icon: "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 21h18M8.25 12h7.5M6 6.75h12M6 12V6.75M18 12V6.75M4.5 3.75h15M4.5 21v-8.25",
                    },
                    {
                      key: "travel",
                      label: "Путешествия",
                      icon: "M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5",
                    },
                    {
                      key: "romantic",
                      label: "Романтические отношения",
                      icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z",
                    },
                    {
                      key: "casual",
                      label: "Свободные отношения",
                      icon: "M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z",
                    },
                  ] as { key: Goal; label: string; icon: string }[]
                ).map((goal) => (
                  <button
                    key={goal.key}
                    type="button"
                    onClick={() => toggleGoal(goal.key)}
                    className={`col-span-1 sm:col-span-2 flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 outline-none transition-all duration-200 ${
                      form.dating_goals.includes(goal.key)
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:bg-accent hover:border-muted-foreground/20"
                    }`}
                  >
                    <svg
                      className="h-10 w-10 sm:h-12 sm:w-12"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={goal.icon}
                      />
                    </svg>
                    <span
                      className={`text-center text-sm font-medium ${form.dating_goals.includes(goal.key) ? "text-primary" : "text-foreground"}`}
                    >
                      {goal.label}
                    </span>
                  </button>
                ))}
              </div>
              {errors.dating_goals && (
                <p className="text-center text-sm text-destructive">
                  {errors.dating_goals}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Назад
                </Button>
                <Button
                  type="submit"
                  disabled={loading || form.dating_goals.length === 0}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Далее"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* ЭТАП 3 */}
          {step === 3 && (
            <form onSubmit={submitRegister} className="w-full space-y-4">
              <h2 className="text-center text-base font-medium text-muted-foreground">
                Последний этап
              </h2>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Город
                </Label>
                <CityCombobox 
                  className="w-full max-w-none"                  
                  value={{ id: form.city_id || form.country_id, type: form.country_id ? 'country' : 'city', label: form.city_label }} 
                  onChange={(val) => setForm(prev => ({ 
                    ...prev, 
                    city_id: val.type === 'city' ? val.id : '',
                    country_id: val.type === 'country' ? val.id : '',
                    city_label: val.label
                  }))} 
                />
                {errors.city_id && (
                  <p className="text-sm text-destructive">{errors.city_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Почта
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="Введите вашу почту"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Пароль
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Создайте пароль"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Символы на картинке
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-2 w-[16rem] shrink-0">
                    <div className="flex relative h-10 min-w-0 flex-1 bg-[#dcdee4] items-center justify-center overflow-hidden rounded-md border border-border">
                      {captchaImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={captchaImage}
                          alt="Капча"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      ) : (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={fetchCaptcha}
                      disabled={loadingCaptcha}
                      title="Обновить картинку"
                    >
                      {loadingCaptcha ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                  <div className="min-w-[6.5rem]">
                    <Input
                      value={form.captchaInput}
                      onChange={(e) =>
                        setForm({ ...form, captchaInput: e.target.value })
                      }
                      placeholder="Введите код"
                      required
                      className="w-[7rem]"
                    />
                  </div>
                </div>
                {errors.captchaInput && (
                  <p className="text-sm text-destructive">
                    {errors.captchaInput}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  Назад
                </Button>
                <Button
                  type="submit"
                    disabled={
                    loading ||
                    !(
                      (form.city_id || form.country_id) && // Проверяем, что город или страна выбраны
                      form.email &&
                      form.password &&
                      form.captchaInput
                    )
                  }
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Зарегистрироваться"
                  )}
                </Button>
              </div>
            </form>
          )}

          {errors.general && (
            <p className="text-center text-sm text-destructive mt-4">
              {errors.general}
            </p>
          )}

          {/* Футер страницы */}
          <div className="mt-6 flex flex-col items-center gap-1.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <svg
                className="h-3.5 w-3.5 shrink-0 text-yellow-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <span>Регистрация через Google недоступна</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground/70">
              Регистрируясь, вы принимаете{" "}
              <a href="/a-conditions" className="underline hover:no-underline">
                условия пользовательского соглашения
              </a>{" "}
              и даете согласие на обработку{" "}
              <a href="/personal_data" className="underline hover:no-underline">
                персональных данных
              </a>
            </p>            
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Соцсети) */}
        <div className="hidden lg:flex lg:min-w-[14rem] lg:flex-1 flex-col lg:pl-8">
          <SocialAuthVertical mode="register" className="w-full" />
        </div>
      </div>
    </div>
  );
}
