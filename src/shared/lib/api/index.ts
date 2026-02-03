// Core client
export { api } from './client';
export type { ApiResponse, ApiError, RequestOptions } from './client';

// Services
export {
  authService,
  causesService,
  donationsService,
  paymentsService,
} from './services';

// Types
export type {
  // Common
  CauseType,
  Currency,
  PaymentMethod,
  PaymentStatus,
  DocumentType,
  PersonType,
  // Auth
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  // Causes
  Cause,
  // Donations
  DonationItem,
  GuestInfo,
  CreateDonationRequest,
  DonationItemResponse,
  Donation,
  CreateDonationResponse,
  // Payments
  TokenizeCardRequest,
  TokenizeCardResponse,
  PSEData,
  ProcessPaymentRequest,
  ProcessPaymentResponse,
  PSEBank,
  // Pagination
  PaginationMeta,
  PaginatedResponse,
} from './types';
