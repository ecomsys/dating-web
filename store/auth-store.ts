// store/auth-store.ts
import { create } from 'zustand';
import api from '@/lib/api';

// Описываем тип Юзера на основе твоей модели Laravel
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  has_completed_onboarding: boolean;
  is_verified: boolean;
  role: 'user' | 'admin' | 'moderator' | 'support';
  avatar_url: string;
  has_active_vip: boolean;
  vip_expires_at: string | null; // <--- Добавили
  has_active_premium: boolean;
  premium_expires_at: string | null; // <--- Добавили
}

interface AuthState {
  user: User | null;
  isLoading: boolean; // Загрузка при проверке сессии
  isInitialized: boolean; // Флаг, что приложение инициализировано (проверили куку)
  
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  // Метод для проверки, залогинен ли юзер (будет дергаться при старте Next.js)
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      // Предполагаем, что ты сделаешь роут GET /api/me в Laravel, 
      // который будет возвращать текущего юзера (через мидлварь auth:sanctum)
      const response = await api.get<{ user: User }>('/me');
      set({ user: response.data.user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    } finally {
      set({ isInitialized: true });
    }
  },

  setUser: (user) => set({ user }),
  
  logout: async () => {
    try {
      await api.post('/logout'); // Роут логаута в Laravel
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null });
      // В Next.js для полного сброса лучше сделать window.location.href = '/'
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }
}));