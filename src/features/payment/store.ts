import { create } from 'zustand';
import { PaymentMethod, CardData, PSEData } from './types';

interface PaymentState {
  // State
  selectedMethod: PaymentMethod | null;
  cardData: CardData | null;
  pseData: PSEData | null;

  // Actions
  selectMethod: (method: PaymentMethod) => void;
  setCardData: (data: CardData) => void;
  setPSEData: (data: PSEData) => void;
  reset: () => void;
}

const initialState = {
  selectedMethod: null as PaymentMethod | null,
  cardData: null as CardData | null,
  pseData: null as PSEData | null,
};

export const usePaymentStore = create<PaymentState>((set) => ({
  ...initialState,

  selectMethod: (method) => {
    set({ selectedMethod: method });
  },

  setCardData: (data) => {
    set({ cardData: data });
  },

  setPSEData: (data) => {
    set({ pseData: data });
  },

  reset: () => {
    set(initialState);
  },
}));
