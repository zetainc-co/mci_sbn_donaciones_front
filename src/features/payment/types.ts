export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PSE' | 'NEQUI' | 'DAVIPLATA';

export interface CardData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export interface PSEData {
  bank: string;
  documentType: string;
  documentNumber: string;
}
