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
    // Backend returns { token, brand, last_four } directly without data wrapper
    return response as unknown as TokenizeCardResponse;
  },

  /**
   * Process payment for a donation
   * - For credit/debit cards: requires card_token from tokenizeCard
   * - For PSE: requires pse_data with bank and document info
   */
  async processPayment(data: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    const response = await api.post<ProcessPaymentResponse>('/payments/process', data);
    // Backend returns { status, donation_id, message, ... } directly without data wrapper
    return response as unknown as ProcessPaymentResponse;
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

  /**
   * Helper: Process Bancolombia Button payment
   */
  async processBancolombiaPayment(donationId: string): Promise<ProcessPaymentResponse> {
    return this.processPayment({
      donation_id: donationId,
      payment_method: 'BANCOLOMBIA_BUTTON',
    });
  },
};
