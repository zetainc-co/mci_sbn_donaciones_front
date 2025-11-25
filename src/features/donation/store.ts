import { create } from 'zustand';
import { CartItem, CauseType, Currency } from './types';

interface DonationState {
  // State
  cart: CartItem[];
  currency: Currency;
  currentStep: number;
  activeTab: CauseType;

  // Actions
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  setCurrency: (currency: Currency) => void;
  setStep: (step: number) => void;
  setActiveTab: (tab: CauseType) => void;
  reset: () => void;

  // Computed
  getTotal: () => number;
}

const initialState = {
  cart: [] as CartItem[],
  currency: 'COP' as Currency,
  currentStep: 1,
  activeTab: 'MOTIVE' as CauseType,
};

export const useDonationStore = create<DonationState>((set, get) => ({
  ...initialState,

  addToCart: (item) => {
    const newItem: CartItem = {
      ...item,
      id: `${item.causeId}-${Date.now()}`,
    };
    set((state) => ({ cart: [...state.cart, newItem] }));
  },

  removeFromCart: (id) => {
    set((state) => ({ cart: state.cart.filter((item) => item.id !== id) }));
  },

  clearCart: () => {
    set({ cart: [] });
  },

  setCurrency: (currency) => {
    set({ currency });
  },

  setStep: (step) => {
    set({ currentStep: step });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  reset: () => {
    set(initialState);
  },

  getTotal: () => {
    return get().cart.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  },
}));
