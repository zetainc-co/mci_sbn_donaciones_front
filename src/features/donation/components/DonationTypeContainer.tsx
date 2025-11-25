import { useState } from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import { Cause, CauseType, Currency } from '../types';
import { PresetChip } from './PresetChip';
import { AmountInput } from './AmountInput';
import { CurrencySelector } from './CurrencySelector';

interface DonationTypeContainerProps {
  type: CauseType;
  causes: Cause[];
  onAdd: (causeId: string, amount: number, quantity: number) => void;
  onCurrencyChange?: (currency: Currency) => void;
}

const typeLabels: Record<CauseType, { title: string; description: string }> = {
  MOTIVE: {
    title: 'Motivos de donación',
    description: 'Selecciona el motivo de tu donación',
  },
  PROJECT: {
    title: 'Proyectos',
    description: 'Apoya nuestros proyectos activos',
  },
  EVENT: {
    title: 'Eventos',
    description: 'Inscríbete a nuestros eventos',
  },
};

export function DonationTypeContainer({
  type,
  causes,
  onAdd,
  onCurrencyChange,
}: DonationTypeContainerProps) {
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState<Currency>('COP');

  const currentCause = causes.find((c) => c.id === selectedCause);

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

  const handleCauseSelect = (causeId: string) => {
    setSelectedCause(causeId);
    setSelectedPreset(null);
    setCustomAmount('');
    setQuantity(1);
    setError('');
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setSelectedPreset(null);
    setCustomAmount('');
    setError('');
    if (onCurrencyChange) {
      onCurrencyChange(newCurrency);
    }
  };

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount(amount.toString());
    setError('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedPreset(null);
    setError('');
  };

  const handleAdd = () => {
    if (!selectedCause) {
      setError('Por favor selecciona una opción');
      return;
    }

    const cause = causes.find((c) => c.id === selectedCause);
    if (!cause) return;

    const amount = cause.fixedAmount || parseInt(customAmount) || selectedPreset;

    if (!amount || amount <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    onAdd(selectedCause, amount, quantity);

    // Reset
    setSelectedCause(null);
    setSelectedPreset(null);
    setCustomAmount('');
    setQuantity(1);
    setError('');
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  const config = typeLabels[type];

  return (
    <div className="bg-white rounded-[12px] p-6 border border-[#E5E7EB] hover:border-[#4E5BFF]/30 transition-all duration-200 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="mb-5 pb-4 border-b border-[#F6F7FB]">
        <h3 className="text-[#111827] mb-1">{config.title}</h3>
        <p className="text-sm text-[#6B7280]">{config.description}</p>
      </div>

      {/* Secondary Categories */}
      <div className="mb-5">
        <label className="text-sm font-medium text-[#374151] mb-3 block">
          Selecciona una opción
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {causes.map((cause) => (
            <button
              key={cause.id}
              onClick={() => handleCauseSelect(cause.id)}
              className={`
                p-4 rounded-[10px] border-2 transition-all duration-200 text-left relative
                ${
                  selectedCause === cause.id
                    ? 'border-[#4E5BFF] bg-[#EEF0FF]'
                    : 'border-[#E5E7EB] bg-white hover:border-[#4E5BFF]/50'
                }
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[#111827] mb-0.5">
                    {cause.name}
                  </h4>
                  <p className="text-xs text-[#6B7280]">{cause.description}</p>
                  {cause.fixedAmount && (
                    <p className="text-sm font-semibold text-[#4E5BFF] mt-2">
                      {formatAmount(cause.fixedAmount)}
                    </p>
                  )}
                </div>
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                    ${
                      selectedCause === cause.id
                        ? 'border-[#4E5BFF] bg-[#4E5BFF]'
                        : 'border-[#D1D5DB] bg-white'
                    }
                  `}
                >
                  {selectedCause === cause.id && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        {error && !selectedCause && (
          <p className="mt-2 text-xs text-[#EF4444]">{error}</p>
        )}
      </div>

      {/* Amount Configuration */}
      {selectedCause && currentCause && (
        <div className="space-y-4 mb-5 p-4 bg-[#F6F7FB] rounded-[10px]">
          {/* Currency Selector */}
          <CurrencySelector value={currency} onChange={handleCurrencyChange} />

          {/* Motive with presets */}
          {currentCause.type === 'MOTIVE' && currentCause.presets && (
            <>
              <div>
                <label className="text-sm font-medium text-[#374151] mb-2 block">
                  Montos sugeridos
                </label>
                <div className="flex flex-wrap gap-2">
                  {(currency === 'USD' && currentCause.presetsUSD
                    ? currentCause.presetsUSD
                    : currentCause.presets
                  ).map((preset) => (
                    <PresetChip
                      key={preset}
                      amount={preset}
                      selected={selectedPreset === preset}
                      onClick={() => handlePresetClick(preset)}
                      currency={currency}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#374151] mb-2 block">
                  Monto personalizado
                </label>
                <AmountInput
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  error={error && !customAmount ? error : ''}
                  placeholder="Ingresa un monto"
                  currency={currency}
                />
              </div>
            </>
          )}

          {/* Project - Fixed amount already shown */}
          {currentCause.type === 'PROJECT' && currentCause.fixedAmount && (
            <div className="text-center py-2">
              <p className="text-sm text-[#6B7280]">
                El monto de este proyecto es fijo
              </p>
            </div>
          )}

          {/* Event with optional quantity */}
          {currentCause.type === 'EVENT' && currentCause.fixedAmount && (
            <>
              {currentCause.allowQuantity && (
                <div>
                  <label className="text-sm font-medium text-[#374151] mb-2 block">
                    Cantidad de personas
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decrementQuantity}
                      className="w-10 h-10 rounded-[10px] bg-white border border-[#E5E7EB] hover:border-[#4E5BFF] hover:bg-[#F6F7FB] flex items-center justify-center transition-all duration-200"
                    >
                      <Minus className="w-4 h-4 text-[#374151]" />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-lg font-semibold text-[#111827]">
                        {quantity}
                      </span>
                    </div>
                    <button
                      onClick={incrementQuantity}
                      className="w-10 h-10 rounded-[10px] bg-white border border-[#E5E7EB] hover:border-[#4E5BFF] hover:bg-[#F6F7FB] flex items-center justify-center transition-all duration-200"
                    >
                      <Plus className="w-4 h-4 text-[#374151]" />
                    </button>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm text-[#6B7280] mb-1">Total</p>
                    <p className="text-xl font-bold text-[#111827]">
                      {formatAmount(currentCause.fixedAmount * quantity)}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={handleAdd}
        disabled={!selectedCause}
        className={`
          w-full py-3.5 px-4 rounded-[10px] font-semibold flex items-center justify-center gap-2 transition-all duration-200
          ${
            selectedCause
              ? 'bg-[#4E5BFF] hover:bg-[#3F46DB] text-white shadow-sm hover:shadow-md'
              : 'bg-[#F6F7FB] text-[#D1D5DB] cursor-not-allowed'
          }
        `}
      >
        <Plus className="w-5 h-5" />
        Agregar a la donación
      </button>
    </div>
  );
}
