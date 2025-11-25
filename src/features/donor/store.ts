import { create } from 'zustand';
import { DonorInfo, DonorType } from './types';

interface DonorState {
  // State
  donorInfo: DonorInfo | null;
  donorType: DonorType | null;

  // Actions
  setDonorInfo: (info: DonorInfo) => void;
  setDonorType: (type: DonorType) => void;
  reset: () => void;
}

const initialState = {
  donorInfo: null as DonorInfo | null,
  donorType: null as DonorType | null,
};

export const useDonorStore = create<DonorState>((set) => ({
  ...initialState,

  setDonorInfo: (info) => {
    set({ donorInfo: info });
  },

  setDonorType: (type) => {
    set({ donorType: type });
  },

  reset: () => {
    set(initialState);
  },
}));
