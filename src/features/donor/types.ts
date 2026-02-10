export type DocumentType = 'CC' | 'CE' | 'TI' | 'PAS' | 'NIT';

export interface DonorInfo {
  fullName: string;
  email: string;
  phone: string;
  documentType: DocumentType;
  documentNumber: string;
  acceptsTerms: boolean;
  prayerRequest?: string;
  userId?: number; // Set when associating guest donation to existing user
}

export type DonorType = 'guest' | 'registered';
