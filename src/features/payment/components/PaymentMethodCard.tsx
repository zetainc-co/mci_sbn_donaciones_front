import { CreditCard, Smartphone, Building2 } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}

const paymentMethods = {
  CREDIT_CARD: {
    icon: CreditCard,
    title: 'Tarjeta de Crédito',
    description: 'Visa, Mastercard, Amex',
  },
  DEBIT_CARD: {
    icon: CreditCard,
    title: 'Tarjeta Débito',
    description: 'Débito bancario',
  },
  PSE: {
    icon: Building2,
    title: 'PSE',
    description: 'Pago electrónico bancario',
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
}: PaymentMethodCardProps) {
  const config = paymentMethods[method];
  const Icon = config.icon;

  return (
    <button
      onClick={onSelect}
      className={`
        w-full p-5 rounded-[12px] border-2 transition-all duration-200
        flex items-center gap-4 text-left
        ${
          selected
            ? 'border-[#4E5BFF] bg-[#EEF0FF] shadow-md'
            : 'border-[#E5E7EB] bg-white hover:border-[#4E5BFF]/50 hover:shadow-sm'
        }
      `}
    >
      <div
        className={`
          w-12 h-12 rounded-[10px] flex items-center justify-center transition-all duration-200
          ${selected ? 'bg-[#4E5BFF]' : 'bg-[#F6F7FB]'}
        `}
      >
        <Icon className={`w-6 h-6 ${selected ? 'text-white' : 'text-[#6B7280]'}`} />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-[#111827] mb-0.5">{config.title}</h4>
        <p className="text-sm text-[#6B7280]">{config.description}</p>
      </div>
      <div
        className={`
          w-5 h-5 rounded-full border-2 transition-all duration-200
          ${
            selected
              ? 'border-[#4E5BFF] bg-[#4E5BFF]'
              : 'border-[#D1D5DB] bg-white'
          }
        `}
      >
        {selected && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}
      </div>
    </button>
  );
}
