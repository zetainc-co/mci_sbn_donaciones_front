/**
 * API Types - MCI Donaciones Backend
 * Generated from API documentation at /docs
 */

// ============================================================================
// Common Types
// ============================================================================

export type CauseType = 'MOTIVE' | 'PROJECT' | 'EVENT';
export type Currency = 'COP' | 'USD';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PSE' | 'BANCOLOMBIA_BUTTON';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type DocumentType = 'CC' | 'CE' | 'TI' | 'PAS' | 'NIT';
export type PersonType = 'NATURAL' | 'JURIDICA';

// ============================================================================
// Auth Types
// ============================================================================

export interface User {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  phone_masked?: string;
  document_type?: DocumentType;
  document_number?: string;
  document_number_masked?: string;
  source?: string;
  email_verified?: boolean;
  verified?: boolean;
  created_at?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  data: User;
  token: string;
}

// ============================================================================
// Cause Types
// ============================================================================

export interface Cause {
  id: string;
  type: CauseType;
  name: string;
  description: string;
  fixed_amount: number | null;
  presets_cop: number[] | null;
  presets_usd: number[] | null;
  allow_quantity: boolean;
  is_active: boolean;
  sort_order: number;
}

// ============================================================================
// Donation Types
// ============================================================================

export interface DonationItem {
  cause_id: string;
  amount: number;
  quantity: number;
}

export interface GuestInfo {
  email: string;
  full_name: string;
  name: string;
  phone?: string;
  document_type: DocumentType;
  document_number: string;
  user_id?: number; // Associate guest donation with existing user (from lookup)
}

export interface CreateDonationRequest {
  items: DonationItem[];
  currency: Currency;
  payment_method: PaymentMethod;
  prayer_request?: string;
  guest_info?: GuestInfo;
}

export interface DonationItemResponse {
  id: string;
  cause_id: string;
  cause_name: string;
  cause_type: CauseType;
  amount: number;
  quantity: number;
  subtotal: number;
}

export interface Donation {
  id: string;
  status: PaymentStatus;
  total_amount: number;
  currency: Currency;
  payment_method: PaymentMethod;
  wompi_reference?: string;
  paid_at?: string;
  items: DonationItemResponse[];
  donor?: {
    full_name: string;
    email: string;
  };
  prayer_request?: string;
  created_at: string;
}

export interface CreateDonationResponse {
  data: Donation;
  payment?: {
    wompi_reference: string;
    redirect_url: string | null;
    requires_action: boolean;
  };
}

// ============================================================================
// Payment Types
// ============================================================================

export interface TokenizeCardRequest {
  card_number: string;
  card_holder: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
}

export interface TokenizeCardResponse {
  token: string;
  brand: string;
  last_four: string;
  expires_at: string;
}

export interface PSEData {
  bank_code: string;
  person_type: PersonType;
  document_type: DocumentType;
  document_number: string;
}

export interface ProcessPaymentRequest {
  donation_id: string;
  payment_method: PaymentMethod;
  card_token?: string;
  installments?: number;
  pse_data?: PSEData;
}

export interface ProcessPaymentResponse {
  status: 'APPROVED' | 'PENDING' | 'DECLINED';
  donation_id: string;
  wompi_transaction_id?: string;
  redirect_url?: string;
  message: string;
}

export interface PSEBank {
  code: string;
  name: string;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
