export interface DonorInfo {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  acceptsTerms: boolean;
}

export type DonorType = 'guest' | 'registered';
