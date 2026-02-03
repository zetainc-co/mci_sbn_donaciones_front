import { create } from 'zustand';
import { CartItem, Cause, CauseType, Currency } from './types';
import {
  causesService,
  donationsService,
  type Cause as ApiCause,
  type CreateDonationRequest,
  type CreateDonationResponse,
} from '@/shared/lib/api';

interface DonationState {
  // State
  causes: Cause[];
  causesLoading: boolean;
  causesError: string | null;
  cart: CartItem[];
  currency: Currency;
  currentStep: number;
  activeTab: CauseType;
  currentDonation: CreateDonationResponse | null;
  isProcessing: boolean;

  // Actions
  loadCauses: () => Promise<void>;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  setCurrency: (currency: Currency) => void;
  setStep: (step: number) => void;
  setActiveTab: (tab: CauseType) => void;
  createDonation: (request: CreateDonationRequest) => Promise<CreateDonationResponse>;
  reset: () => void;

  // Computed
  getTotal: () => number;
  getCauseById: (id: string) => Cause | undefined;
  getFilteredCauses: () => Cause[];
}

// Map API cause to frontend cause format
const mapApiCauseToFrontend = (apiCause: ApiCause): Cause => ({
  id: apiCause.id,
  type: apiCause.type,
  name: apiCause.name,
  description: apiCause.description,
  fixedAmount: apiCause.fixed_amount ?? undefined,
  presets: apiCause.presets_cop ?? undefined,
  presetsUSD: apiCause.presets_usd ?? undefined,
  allowQuantity: apiCause.allow_quantity,
});

const initialState = {
  causes: [] as Cause[],
  causesLoading: false,
  causesError: null as string | null,
  cart: [] as CartItem[],
  currency: 'COP' as Currency,
  currentStep: 1,
  activeTab: 'MOTIVE' as CauseType,
  currentDonation: null as CreateDonationResponse | null,
  isProcessing: false,
};

export const useDonationStore = create<DonationState>((set, get) => ({
  ...initialState,

  loadCauses: async () => {
    set({ causesLoading: true, causesError: null });
    try {
      const apiCauses = await causesService.getAll();
      const causes = apiCauses.map(mapApiCauseToFrontend);
      set({ causes, causesLoading: false });
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Error al cargar causas';
      set({ causesError: message, causesLoading: false });
    }
  },

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

  createDonation: async (request) => {
    set({ isProcessing: true });
    try {
      const response = await donationsService.create(request);
      set({ currentDonation: response, isProcessing: false });
      return response;
    } catch (err) {
      set({ isProcessing: false });
      throw err;
    }
  },

  reset: () => {
    set({
      ...initialState,
      causes: get().causes, // Preserve loaded causes
    });
  },

  getTotal: () => {
    return get().cart.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  },

  getCauseById: (id) => {
    return get().causes.find((c) => c.id === id);
  },

  getFilteredCauses: () => {
    const { causes, activeTab } = get();
    return causes.filter((cause) => cause.type === activeTab);
  },
}));
