/**
 * Payments Service - Payment processing API endpoints
 */
import { api } from '../client';
import type {
  TokenizeCardRequest,
  TokenizeCardResponse,
  ProcessPaymentRequest,
  ProcessPaymentResponse,
  PSEBank,
} from '../types';

export const paymentsService = {
  /**
   * Tokenize a credit/debit card for payment
   */
  async tokenizeCard(data: TokenizeCardRequest): Promise<TokenizeCardResponse> {
    const response = await api.post<TokenizeCardResponse>('/payments/card/tokenize', data);
    return response.data;
  },

  /**
   * Process payment for a donation
   * - For credit/debit cards: requires card_token from tokenizeCard
   * - For PSE: requires pse_data with bank and document info
   */
  async processPayment(data: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    const response = await api.post<ProcessPaymentResponse>('/payments/process', data);
    return response.data;
  },

  /**
   * Get list of available PSE banks
   */
  async getPSEBanks(): Promise<PSEBank[]> {
    const response = await api.get<PSEBank[]>('/payments/pse/banks');
    return response.data;
  },

  /**
   * Helper: Process card payment (tokenize + process in one call)
   */
  async processCardPayment(
    donationId: string,
    cardData: TokenizeCardRequest,
    installments: number = 1
  ): Promise<ProcessPaymentResponse> {
    // Step 1: Tokenize the card
    const tokenResponse = await this.tokenizeCard(cardData);

    // Step 2: Process the payment with the token
    return this.processPayment({
      donation_id: donationId,
      payment_method: 'CREDIT_CARD',
      card_token: tokenResponse.token,
      installments,
    });
  },

  /**
   * Helper: Process PSE payment
   */
  async processPSEPayment(
    donationId: string,
    bankCode: string,
    personType: 'NATURAL' | 'JURIDICA',
    documentType: 'CC' | 'CE' | 'TI' | 'PAS' | 'NIT',
    documentNumber: string
  ): Promise<ProcessPaymentResponse> {
    return this.processPayment({
      donation_id: donationId,
      payment_method: 'PSE',
      pse_data: {
        bank_code: bankCode,
        person_type: personType,
        document_type: documentType,
        document_number: documentNumber,
      },
    });
  },
};
