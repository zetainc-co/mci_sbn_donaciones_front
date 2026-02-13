import { DollarSign } from 'lucide-react';
import { Currency } from '../types';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  currency?: Currency;
}

export function AmountInput({
  value,
  onChange,
  error,
  placeholder = '0',
  currency = 'COP',
}: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^0-9]/g, '');
    onChange(input);
  };

  const displayValue = value
    ? Number(value).toLocaleString('es-CO')
    : '';

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]">
          <DollarSign className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`
            w-full pl-12 pr-4 py-3.5 glass-input
            text-[#111827] placeholder:text-[#D1D5DB]
            ${error ? 'border-[#EF4444] focus:ring-[#EF4444]/10' : ''}
          `}
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] text-sm font-medium">
          {currency}
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-[#EF4444] ml-1">{error}</p>}
    </div>
  );
}
