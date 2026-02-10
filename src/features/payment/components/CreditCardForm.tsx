import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Lock } from 'lucide-react';
import { CardData } from '../types';

interface CreditCardFormProps {
  onDataChange?: (data: CardData) => void;
}

export function CreditCardForm({ onDataChange }: CreditCardFormProps) {
  const [formData, setFormData] = useState<CardData>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  // Notify parent when form data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData);
    }
  }, [formData, onDataChange]);

  const handleChange = (field: keyof CardData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpirationDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="mt-6 p-6 bg-[#F6F7FB] rounded-[12px] border border-[#E5E7EB] space-y-4">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-[#111827]">Datos de la tarjeta</h3>
        <p className="text-xs text-[#6B7280] mt-1">
          Ingresa los datos de tu tarjeta de forma segura
        </p>
      </div>

      {/* Cardholder Name */}
      <div>
        <label
          htmlFor="cardholderName"
          className="text-sm font-medium text-[#374151] mb-2 block"
        >
          Nombre del titular
        </label>
        <input
          type="text"
          id="cardholderName"
          placeholder="Como aparece en la tarjeta"
          value={formData.cardHolder}
          className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 focus:border-[#4E5BFF] transition-all duration-200"
          onChange={(e) => handleChange('cardHolder', e.target.value)}
        />
      </div>

      {/* Card Number */}
      <div>
        <label
          htmlFor="cardNumber"
          className="text-sm font-medium text-[#374151] mb-2 block"
        >
          Número de la tarjeta
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
            <CreditCard className="w-5 h-5" />
          </div>
          <input
            type="text"
            id="cardNumber"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            value={formData.cardNumber}
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 focus:border-[#4E5BFF] transition-all duration-200"
            onChange={(e) => {
              const formatted = formatCardNumber(e.target.value);
              handleChange('cardNumber', formatted);
            }}
          />
        </div>
      </div>

      {/* Expiration Date and CVV */}
      <div className="grid grid-cols-2 gap-4">
        {/* Expiration Date */}
        <div>
          <label
            htmlFor="expirationDate"
            className="text-sm font-medium text-[#374151] mb-2 block"
          >
            Fecha de expiración
          </label>
          <div className="relative">
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <input
              type="text"
              id="expirationDate"
              placeholder="MM/AA"
              maxLength={5}
              value={formData.expiryDate}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 focus:border-[#4E5BFF] transition-all duration-200"
              onChange={(e) => {
                const formatted = formatExpirationDate(e.target.value);
                handleChange('expiryDate', formatted);
              }}
            />
          </div>
        </div>

        {/* CVV */}
        <div>
          <label
            htmlFor="cvv"
            className="text-sm font-medium text-[#374151] mb-2 block"
          >
            CVV
          </label>
          <div className="relative">
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <input
              type="text"
              id="cvv"
              placeholder="123"
              maxLength={4}
              value={formData.cvv}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 focus:border-[#4E5BFF] transition-all duration-200"
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9]/g, '');
                handleChange('cvv', cleaned);
              }}
            />
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="flex items-start gap-2 mt-4 p-3 bg-white rounded-[8px] border border-[#E5E7EB]">
        <Lock className="w-4 h-4 text-[#4E5BFF] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#6B7280]">
          Tus datos están protegidos con encriptación de nivel bancario
        </p>
      </div>
    </div>
  );
}
