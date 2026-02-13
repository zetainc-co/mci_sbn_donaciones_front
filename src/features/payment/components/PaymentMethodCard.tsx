import { CreditCard, Smartphone, Building2 } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  disabledText?: string;
}

const paymentMethods = {
  CREDIT_CARD: {
    icon: CreditCard,
    title: 'Tarjeta de Crédito / Débito',
    description: 'Visa, Mastercard, Amex',
  },
  DEBIT_CARD: {
    icon: CreditCard,
    title: 'Tarjeta Débito',
    description: 'Débito bancario',
  },
  BANCOLOMBIA_BUTTON: {
    icon: Smartphone,
    title: 'Botón Bancolombia',
    description: 'Paga desde tu app Bancolombia',
  },
  PSE: {
    icon: Building2,
    title: 'PSE',
    description: 'Donación electrónica bancaria',
  },
  NEQUI: {
    icon: Smartphone,
    title: 'Nequi',
    description: 'Billetera digital',
  },
  DAVIPLATA: {
    icon: Smartphone,
    title: 'Daviplata',
    description: 'Billetera digital',
  },
};

export function PaymentMethodCard({
  method,
  selected,
  onSelect,
  disabled = false,
  disabledText,
}: PaymentMethodCardProps) {
  const config = paymentMethods[method];
  const Icon = config.icon;

  return (
    <button
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className={`
        w-full p-5 rounded-[12px] border-2 transition-all duration-200
        flex items-center gap-4 text-left
        ${
          disabled
            ? 'border-[#E5E7EB] bg-[#F9FAFB] cursor-not-allowed opacity-60'
            : selected
              ? 'border-[#4E5BFF] bg-[#EEF0FF] shadow-md'
              : 'border-[#E5E7EB] bg-white hover:border-[#4E5BFF]/50 hover:shadow-sm'
        }
      `}
    >
      <div
        className={`
          w-12 h-12 rounded-[10px] flex items-center justify-center transition-all duration-200
          ${disabled ? 'bg-[#E5E7EB]' : selected ? 'bg-[#4E5BFF]' : 'bg-[#F6F7FB]'}
        `}
      >
        <Icon className={`w-6 h-6 ${disabled ? 'text-[#9CA3AF]' : selected ? 'text-white' : 'text-[#6B7280]'}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className={`font-semibold mb-0.5 ${disabled ? 'text-[#9CA3AF]' : 'text-[#111827]'}`}>
            {config.title}
          </h4>
          {disabled && disabledText && (
            <span className="px-2 py-0.5 text-xs font-medium bg-[#FEF3C7] text-[#92400E] rounded-full">
              {disabledText}
            </span>
          )}
        </div>
        <p className={`text-sm ${disabled ? 'text-[#D1D5DB]' : 'text-[#6B7280]'}`}>{config.description}</p>
      </div>
      <div
        className={`
          w-5 h-5 rounded-full border-2 transition-all duration-200
          ${
            disabled
              ? 'border-[#D1D5DB] bg-[#F3F4F6]'
              : selected
                ? 'border-[#4E5BFF] bg-[#4E5BFF]'
                : 'border-[#D1D5DB] bg-white'
          }
        `}
      >
        {selected && !disabled && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}
      </div>
    </button>
  );
}
