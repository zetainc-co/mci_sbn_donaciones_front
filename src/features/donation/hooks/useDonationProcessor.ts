import { useState, useCallback } from 'react';
import {
  donationsService,
  paymentsService,
  type CreateDonationRequest,
  type CreateDonationResponse,
  type ProcessPaymentResponse,
  type PaymentMethod,
} from '@/shared/lib/api';
import type { CartItem, Currency } from '../types';
import type { DonorInfo } from '@/features/donor/types';
import type { CardData, PSEData } from '@/features/payment/types';

export interface ProcessDonationParams {
  cart: CartItem[];
  currency: Currency;
  paymentMethod: PaymentMethod;
  donorInfo: DonorInfo;
  cardData?: CardData | null;
  pseData?: PSEData | null;
  prayerRequest?: string;
}

export interface ProcessResult {
  type: 'card' | 'pse' | 'bancolombia';
  status: 'APPROVED' | 'PENDING' | 'PROCESSING' | 'DECLINED';
  donation: CreateDonationResponse;
  payment: ProcessPaymentResponse;
  redirectUrl?: string;
}

export function useDonationProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const processDonation = useCallback(
    async (params: ProcessDonationParams): Promise<ProcessResult> => {
      const { cart, currency, paymentMethod, donorInfo, cardData, pseData, prayerRequest } =
        params;

      setIsProcessing(true);
      setError(null);

      try {
        // 1. Create donation request
        const donationRequest: CreateDonationRequest = {
          items: cart.map((item) => ({
            cause_id: item.causeId,
            amount: item.amount,
            quantity: item.quantity,
          })),
          currency,
          payment_method: paymentMethod,
          prayer_request: prayerRequest,
          guest_info: {
            email: donorInfo.email,
            full_name: donorInfo.fullName,
            name: donorInfo.fullName,
            phone: donorInfo.phone || undefined,
            document_type: donorInfo.documentType,
            document_number: donorInfo.documentNumber,
            user_id: donorInfo.userId, // Associate with existing user if found via lookup
          },
        };

        // 2. Create donation in backend
        const donation = await donationsService.create(donationRequest);
        const donationId = donation.data.id;

        // 3. Process payment based on method
        let paymentResult: ProcessPaymentResponse;

        if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
          if (!cardData) {
            throw new Error('Datos de tarjeta requeridos');
          }

          // Parse expiry date (MM/YY format)
          const [expiryMonth, expiryYear] = cardData.expiryDate.split('/');

          paymentResult = await paymentsService.processCardPayment(
            donationId,
            {
              card_number: cardData.cardNumber.replace(/\s/g, ''),
              card_holder: cardData.cardHolder,
              expiry_month: expiryMonth.trim(),
              expiry_year: expiryYear.trim(),
              cvv: cardData.cvv,
            },
            1 // installments
          );

          const processResult: ProcessResult = {
            type: 'card',
            status: paymentResult.status,
            donation,
            payment: paymentResult,
          };

          setResult(processResult);
          setIsProcessing(false);
          return processResult;
        } else if (paymentMethod === 'PSE') {
          if (!pseData) {
            throw new Error('Datos de PSE requeridos');
          }

          paymentResult = await paymentsService.processPSEPayment(
            donationId,
            pseData.bankCode,
            pseData.personType,
            pseData.documentType,
            pseData.documentNumber
          );

          const processResult: ProcessResult = {
            type: 'pse',
            status: paymentResult.status,
            donation,
            payment: paymentResult,
            redirectUrl: paymentResult.redirect_url,
          };

          setResult(processResult);
          setIsProcessing(false);

          // Open bank in new tab so confirmation page stays visible as fallback
          if (paymentResult.redirect_url) {
            window.open(paymentResult.redirect_url, '_blank', 'noopener,noreferrer');
          }

          return processResult;
        } else if (paymentMethod === 'BANCOLOMBIA_BUTTON') {
          paymentResult = await paymentsService.processBancolombiaPayment(donationId);

          const processResult: ProcessResult = {
            type: 'bancolombia',
            status: paymentResult.status,
            donation,
            payment: paymentResult,
            redirectUrl: paymentResult.redirect_url,
          };

          setResult(processResult);
          setIsProcessing(false);

          // Open Bancolombia in new tab so confirmation page stays visible as fallback
          if (paymentResult.redirect_url) {
            window.open(paymentResult.redirect_url, '_blank', 'noopener,noreferrer');
          }

          return processResult;
        } else {
          throw new Error('Método de pago no soportado');
        }
      } catch (err) {
        const message =
          (err as { message?: string })?.message || 'Error al procesar la donación';
        setError(message);
        setIsProcessing(false);
        throw err;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsProcessing(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    processDonation,
    isProcessing,
    error,
    result,
    reset,
  };
}
