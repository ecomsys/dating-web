// components/modals/auth/login-modal.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useUIStore } from "@/store/ui-store";
import api from "@/lib/api";
import { AxiosError } from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, RefreshCw, Loader2 } from "lucide-react";

interface ValidationErrors {
  email?: string[];
  password?: string[];
  captchaInput?: string[];
}

// 1. Выносим форму в отдельный компонент!
// Radix Dialog монтирует/размонтирует его, стейт всегда будет чистым.
function LoginForm() {
  const {
    closeLoginModal,
    openForgotPasswordModal,
    openRegisterModal,
    loginPrefillEmail,
  } = useUIStore();
  // Инициализируем email из стора (если перешли из модалки восстановления)
  const [email, setEmail] = useState(loginPrefillEmail || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const fetchCaptcha = useCallback(async () => {
    try {
      const res = await api.get<{ image: string }>("/captcha/login");
      // Это не синхронный setState в эффекте, это асинхронный вызов, линтер спокоен
      setCaptchaImage(res.data.image);
    } catch (error) {
      console.error("Ошибка загрузки капчи", error);
    }
  }, []);

  useEffect(() => {
    // Вызывается один раз при монтировании (когда модалка открывается)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCaptcha();
  }, [fetchCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await api.post<{ success: boolean; redirect: string }>(
        "/login",
        {
          email,
          password,
          captchaInput,
          remember,
        },
      );

      if (res.data.success) {
        window.location.href = res.data.redirect;
      }
    } catch (error) {
      const err = error as AxiosError<{ errors: ValidationErrors }>;
      if (
        err.response &&
        err.response.status === 422 &&
        err.response.data.errors
      ) {
        setErrors(err.response.data.errors);
        if (
          err.response.data.errors.email ||
          err.response.data.errors.captchaInput
        ) {
          fetchCaptcha();
          setCaptchaInput("");
        }
      } else {
        setErrors({
          email: ["Ошибка сервера. Обновите страницу и попробуйте снова."],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {/* ЛЕВАЯ КОЛОНКА: Форма входа */}
      <div className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Ваш Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="username"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-password">Пароль</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-xs text-destructive mt-1">
                {errors.password[0]}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              variant="link"
              className="text-xs p-0 h-auto text-primary"
              onClick={() => openForgotPasswordModal(email)}
            >
              Напомнить пароль
            </Button>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked === true)}
              />
              <Label
                htmlFor="remember"
                className="text-xs font-normal cursor-pointer"
              >
                Чужой компьютер
              </Label>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <Label>Символы на картинке</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 h-10 rounded border border-border bg-[#dcdee4] overflow-hidden flex items-center justify-center">
                  {captchaImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={captchaImage}
                      alt="Captcha"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  ) : (
                    <Loader2 className="w-5 h-5 text-muted-foreground/50 animate-spin" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-10 w-10"
                  onClick={() => {
                    fetchCaptcha();
                    setCaptchaInput("");
                  }}
                  title="Обновить картинку"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <RefreshCw className="w-6 h-6" />
                  )}
                </Button>
              </div>
              <Input
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Введите код"
                className="w-full"
              />
            </div>
            {errors.captchaInput && (
              <p className="text-xs text-destructive mt-1">
                {errors.captchaInput[0]}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Вход...
              </span>
            ) : (
              "Войти"
            )}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center leading-relaxed pt-1">
            Нажимая кнопку Войти, вы принимаете условия пользовательского
            соглашения и даете согласие на обработку персональных данных.
          </p>
        </form>
      </div>

      {/* ПРАВАЯ КОЛОНКА: Плашка регистрации */}
      <div className="border-t border-border md:border-t-0 md:border-l p-6  text-center space-y-2 flex flex-col">
        <h4 className="font-semibold text-lg">У вас ещё нет анкеты?</h4>
        <p className="text-sm text-muted-foreground">
          Вы найдете множество интересных людей из вашего города. Начните
          общаться прямо сейчас.
        </p>
        <p className="text-xs text-muted-foreground pb-2">
          Регистрация займет меньше минуты.
        </p>
        <Button
          variant="default"
          onClick={() => {
            closeLoginModal();
            openRegisterModal();
          }}
        >
          Регистрация
        </Button>
      </div>
    </div>
  );
}

// 2. Сама обертка модалки
export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useUIStore();

  // Авто-открытие, если в URL есть ?login=1
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("login")) {
        useUIStore.getState().openLoginModal();
      }
    }
  }, []);

  return (
    <Dialog
      open={isLoginModalOpen}
      onOpenChange={(open) => !open && closeLoginModal()}
    >
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Вход на сайт
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Проверьте пароль и введите код подтверждения.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Внутри рендерится форма. 
        Когда модалка закрыта, DialogContent не рендерится, 
        а значит и LoginForm не висит в DOM. */}
        <LoginForm />
      </DialogContent>
    </Dialog>
  );
}
