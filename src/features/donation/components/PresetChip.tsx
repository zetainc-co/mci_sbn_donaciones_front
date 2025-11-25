import { Currency } from '../types';

interface PresetChipProps {
  amount: number;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  currency?: Currency;
}

export function PresetChip({
  amount,
  selected,
  onClick,
  disabled,
  currency = 'COP',
}: PresetChipProps) {
  const formatAmount = (value: number) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200
        ${
          selected
            ? 'bg-[#4E5BFF] text-white shadow-md'
            : 'bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#4E5BFF] hover:text-[#4E5BFF] hover:shadow-sm'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {formatAmount(amount)}
    </button>
  );
}
