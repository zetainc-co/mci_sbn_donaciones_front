import { create } from 'zustand';
import { PaymentMethod, CardData, PSEData } from './types';
import {
  paymentsService,
  type PSEBank,
  type ProcessPaymentResponse,
  type TokenizeCardResponse,
} from '@/shared/lib/api';

interface PaymentState {
  // State
  selectedMethod: PaymentMethod | null;
  cardData: CardData | null;
  pseData: PSEData | null;
  pseBanks: PSEBank[];
  pseBanksLoading: boolean;
  isProcessing: boolean;
  cardToken: TokenizeCardResponse | null;
  paymentResult: ProcessPaymentResponse | null;
  error: string | null;

  // Actions
  selectMethod: (method: PaymentMethod) => void;
  setCardData: (data: CardData) => void;
  setPSEData: (data: PSEData) => void;
  loadPSEBanks: () => Promise<void>;
  tokenizeCard: () => Promise<TokenizeCardResponse>;
  processPayment: (donationId: string) => Promise<ProcessPaymentResponse>;
  reset: () => void;
}

const initialState = {
  selectedMethod: null as PaymentMethod | null,
  cardData: null as CardData | null,
  pseData: null as PSEData | null,
  pseBanks: [] as PSEBank[],
  pseBanksLoading: false,
  isProcessing: false,
  cardToken: null as TokenizeCardResponse | null,
  paymentResult: null as ProcessPaymentResponse | null,
  error: null as string | null,
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
  ...initialState,

  selectMethod: (method) => {
    set({ selectedMethod: method, error: null });
  },

  setCardData: (data) => {
    set({ cardData: data });
  },

  setPSEData: (data) => {
    set({ pseData: data });
  },

  loadPSEBanks: async () => {
    if (get().pseBanks.length > 0) return; // Already loaded
    set({ pseBanksLoading: true });
    try {
      const banks = await paymentsService.getPSEBanks();
      set({ pseBanks: banks, pseBanksLoading: false });
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Error al cargar bancos';
      set({ error: message, pseBanksLoading: false });
    }
  },

  tokenizeCard: async () => {
    const { cardData } = get();
    if (!cardData) throw new Error('No hay datos de tarjeta');

    set({ isProcessing: true, error: null });
    try {
      // Parse expiry date (MM/YY format)
      const [expiryMonth, expiryYear] = cardData.expiryDate.split('/');

      const token = await paymentsService.tokenizeCard({
        card_number: cardData.cardNumber.replace(/\s/g, ''),
        card_holder: cardData.cardHolder,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        cvv: cardData.cvv,
      });

      set({ cardToken: token, isProcessing: false });
      return token;
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Error al procesar tarjeta';
      set({ error: message, isProcessing: false });
      throw err;
    }
  },

  processPayment: async (donationId: string) => {
    const { selectedMethod, cardToken, pseData } = get();
    if (!selectedMethod) throw new Error('No hay método de pago seleccionado');

    set({ isProcessing: true, error: null });
    try {
      let result: ProcessPaymentResponse;

      if (selectedMethod === 'CREDIT_CARD' || selectedMethod === 'DEBIT_CARD') {
        if (!cardToken) {
          // Tokenize first if not already done
          await get().tokenizeCard();
        }
        const token = get().cardToken;
        if (!token) throw new Error('Error al tokenizar tarjeta');

        result = await paymentsService.processPayment({
          donation_id: donationId,
          payment_method: selectedMethod,
          card_token: token.token,
          installments: 1,
        });
      } else if (selectedMethod === 'PSE') {
        if (!pseData) throw new Error('No hay datos de PSE');

        result = await paymentsService.processPayment({
          donation_id: donationId,
          payment_method: 'PSE',
          pse_data: {
            bank_code: pseData.bankCode,
            person_type: pseData.personType,
            document_type: pseData.documentType,
            document_number: pseData.documentNumber,
          },
        });
      } else {
        throw new Error('Método de pago no soportado');
      }

      set({ paymentResult: result, isProcessing: false });
      return result;
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Error al procesar pago';
      set({ error: message, isProcessing: false });
      throw err;
    }
  },

  reset: () => {
    set({
      ...initialState,
      pseBanks: get().pseBanks, // Preserve loaded banks
    });
  },
}));
