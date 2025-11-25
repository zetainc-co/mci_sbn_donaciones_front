import { useState } from 'react';
import {
  Trash2,
  ShieldCheck,
  Lock,
  Shield,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { CartItem } from '../types';

interface CartPanelProps {
  items: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  showCheckoutButton?: boolean;
}

export function CartPanel({
  items,
  onRemoveItem,
  onCheckout,
  showCheckoutButton = true,
}: CartPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const total = items.reduce((sum, item) => sum + item.amount * item.quantity, 0);

  const getTypeLabel = (type: string) => {
    const labels = {
      MOTIVE: 'Donación',
      PROJECT: 'Proyecto',
      EVENT: 'Evento',
    };
    return labels[type as keyof typeof labels] || 'Donación';
  };

  return (
    <>
      {/* Desktop Version - Sticky Sidebar */}
      <div className="hidden lg:block bg-white rounded-[12px] border border-[#E5E7EB] p-6 sticky top-6 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-[#111827] mb-1">Tu donación</h3>
          <p className="text-sm text-[#6B7280]">
            Resumen de tu aporte ({items.length}{' '}
            {items.length === 1 ? 'concepto' : 'conceptos'})
          </p>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-[#F6F7FB] rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-[#D1D5DB]" />
            </div>
            <p className="text-sm text-[#9CA3AF]">
              No has agregado donaciones aún
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="group p-4 bg-[#F6F7FB] rounded-[10px] hover:bg-[#ECEEF3] transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-[#111827] mb-1 truncate">
                      {item.causeName}
                    </h4>
                    <p className="text-xs text-[#6B7280] mb-2">
                      {getTypeLabel(item.type)}
                      {item.quantity > 1 && ` × ${item.quantity}`}
                    </p>
                    <p className="text-sm font-semibold text-[#4E5BFF]">
                      {formatAmount(item.amount * item.quantity)}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-white rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-[#EF4444]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        {items.length > 0 && (
          <>
            <div className="border-t border-[#ECEEF3] pt-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">Total</span>
                <span className="text-2xl font-bold text-[#111827]">
                  {formatAmount(total)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            {showCheckoutButton && (
              <button
                onClick={onCheckout}
                className="w-full py-3.5 px-4 bg-[#4E5BFF] hover:bg-[#3F46DB] text-white rounded-[10px] font-semibold transition-all duration-200 shadow-md hover:shadow-lg mb-6"
              >
                Donar ahora
              </button>
            )}
          </>
        )}

        {/* Trust Indicators */}
        <div className="border-t border-[#ECEEF3] pt-5">
          <p className="text-xs text-[#9CA3AF] mb-3">Transacción segura</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-2 p-3 bg-[#F6F7FB] rounded-[8px]">
              <Lock className="w-5 h-5 text-[#22C55E]" />
              <span className="text-[10px] text-[#6B7280] text-center leading-tight">
                Cifrado SSL
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-[#F6F7FB] rounded-[8px]">
              <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
              <span className="text-[10px] text-[#6B7280] text-center leading-tight">
                PCI-DSS
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-[#F6F7FB] rounded-[8px]">
              <Shield className="w-5 h-5 text-[#22C55E]" />
              <span className="text-[10px] text-[#6B7280] text-center leading-tight">
                OWASP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version - Fixed Bottom Sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E7EB] shadow-[0px_-4px_12px_rgba(0,0,0,0.08)]">
        {/* Expandable Details */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? 'max-h-[70vh]' : 'max-h-0'
          }`}
        >
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-[#F6F7FB] rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 text-[#D1D5DB]" />
                </div>
                <p className="text-sm text-[#9CA3AF]">
                  No has agregado donaciones
                </p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#F6F7FB] rounded-[10px] flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[#111827] mb-1 truncate">
                        {item.causeName}
                      </h4>
                      <p className="text-xs text-[#6B7280] mb-1">
                        {getTypeLabel(item.type)}
                        {item.quantity > 1 && ` × ${item.quantity}`}
                      </p>
                      <p className="text-sm font-semibold text-[#4E5BFF]">
                        {formatAmount(item.amount * item.quantity)}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-[#EF4444]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Trust Indicators Mobile */}
            {items.length > 0 && (
              <div className="border-t border-[#ECEEF3] pt-4">
                <p className="text-xs text-[#9CA3AF] mb-2">Transacción segura</p>
                <div className="flex gap-2 justify-center">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F6F7FB] rounded-[8px]">
                    <Lock className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-[10px] text-[#6B7280]">SSL</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F6F7FB] rounded-[8px]">
                    <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-[10px] text-[#6B7280]">PCI-DSS</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F6F7FB] rounded-[8px]">
                    <Shield className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-[10px] text-[#6B7280]">OWASP</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="p-4 bg-white">
          {/* Toggle Button */}
          {items.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between mb-3 py-2 px-3 bg-[#F6F7FB] rounded-[10px] hover:bg-[#ECEEF3] transition-colors"
            >
              <span className="text-sm text-[#6B7280]">
                {items.length} {items.length === 1 ? 'concepto' : 'conceptos'}
              </span>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-[#6B7280]" />
              ) : (
                <ChevronUp className="w-5 h-5 text-[#6B7280]" />
              )}
            </button>
          )}

          {/* Total and Action */}
          {items.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-[#6B7280] mb-0.5">Total</p>
                <p className="text-xl font-bold text-[#111827]">
                  {formatAmount(total)}
                </p>
              </div>
              {showCheckoutButton && (
                <button
                  onClick={onCheckout}
                  className="flex-shrink-0 py-3 px-6 bg-[#4E5BFF] hover:bg-[#3F46DB] text-white rounded-[10px] font-semibold transition-all duration-200 shadow-md active:scale-95"
                >
                  Donar ahora
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-[#9CA3AF]">
                Agrega donaciones para continuar
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
