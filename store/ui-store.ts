// store/ui-store.ts
import { create } from 'zustand';

interface UIState {

  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  isForgotPasswordModalOpen: boolean;
  
  // Почты для предзаполнения при переходе между модалками
  prefillEmail: string; 
  loginPrefillEmail: string;

  openLoginModal: (email?: string) => void;
  closeLoginModal: () => void;
  
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  
  openForgotPasswordModal: (email?: string) => void;
  closeForgotPasswordModal: () => void;


  // Добавь в UIState:
  isBillingModalOpen: boolean;
  isPremiumModalOpen: boolean;
  isVipModalOpen: boolean;

  openBillingModal: () => void;
  openPremiumModal: () => void;
  openVipModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({

  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  isForgotPasswordModalOpen: false,
  prefillEmail: '',
  loginPrefillEmail: '',
  
  // Теперь принимаем email
  openLoginModal: (email = '') => set({ isLoginModalOpen: true, loginPrefillEmail: email }),
  closeLoginModal: () => set({ isLoginModalOpen: false, loginPrefillEmail: '' }),
  
  openRegisterModal: () => set({ isRegisterModalOpen: true }),
  closeRegisterModal: () => set({ isRegisterModalOpen: false }),
  
  openForgotPasswordModal: (email = '') => set({ isForgotPasswordModalOpen: true, prefillEmail: email, isLoginModalOpen: false }),
  closeForgotPasswordModal: () => set({ isForgotPasswordModalOpen: false, prefillEmail: '' }),


  isBillingModalOpen: false,
  isPremiumModalOpen: false,
  isVipModalOpen: false,
  openBillingModal: () => set({ isBillingModalOpen: true }),
  openPremiumModal: () => set({ isPremiumModalOpen: true }),
  openVipModal: () => set({ isVipModalOpen: true }),
}));