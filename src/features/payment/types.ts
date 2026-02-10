export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PSE' | 'NEQUI' | 'DAVIPLATA';
export type PersonType = 'NATURAL' | 'JURIDICA';
export type DocumentType = 'CC' | 'CE' | 'TI' | 'PAS' | 'NIT';

export interface CardData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export interface PSEData {
  bankCode: string;
  personType: PersonType;
  documentType: DocumentType;
  documentNumber: string;
}
