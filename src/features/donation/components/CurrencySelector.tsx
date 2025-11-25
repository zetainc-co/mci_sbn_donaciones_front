import { ChevronDown } from 'lucide-react';
import { Currency } from '../types';

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
}

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: 'COP', label: 'Peso colombiano', symbol: 'COP $' },
  { value: 'USD', label: 'Dólar estadounidense', symbol: 'USD $' },
];

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  return (
    <div className="relative">
      <label className="text-sm font-medium text-[#374151] mb-2 block">
        Tipo de moneda
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as Currency)}
          className="w-full appearance-none bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-3 pr-10 text-sm text-[#111827] font-medium cursor-pointer hover:border-[#4E5BFF] focus:outline-none focus:ring-2 focus:ring-[#4E5BFF]/20 focus:border-[#4E5BFF] transition-all duration-200"
        >
          {currencies.map((currency) => (
            <option key={currency.value} value={currency.value}>
              {currency.symbol} - {currency.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
      </div>
    </div>
  );
}
