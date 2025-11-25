import { CheckCircle2, Download, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';
import { DonorInfo } from '@/features/donor/types';
import { PaymentMethod } from '@/features/payment/types';

interface ConfirmationPanelProps {
  items: CartItem[];
  donorInfo: DonorInfo;
  paymentMethod: PaymentMethod;
  onDownload: () => void;
  onFinish: () => void;
}

const paymentMethodNames = {
  CREDIT_CARD: 'Tarjeta de Crédito',
  DEBIT_CARD: 'Tarjeta Débito',
  PSE: 'PSE',
  NEQUI: 'Nequi',
  DAVIPLATA: 'Daviplata',
};

export function ConfirmationPanel({
  items,
  donorInfo,
  paymentMethod,
  onDownload,
  onFinish,
}: ConfirmationPanelProps) {
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const total = items.reduce((sum, item) => sum + item.amount * item.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Icon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#22C55E]/10 rounded-full mb-6">
          <CheckCircle2 className="w-12 h-12 text-[#22C55E]" />
        </div>
        <h2 className="text-[#111827] mb-2">¡Gracias por tu generosidad!</h2>
        <p className="text-[#6B7280]">
          Tu donación ha sido procesada exitosamente. Has marcado la diferencia.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-6 mb-6 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
        <h3 className="text-[#111827] mb-4">Resumen de tu donación</h3>

        {/* Donor Info */}
        <div className="mb-6 p-4 bg-[#F6F7FB] rounded-[10px]">
          <p className="text-sm text-[#6B7280] mb-1">Donante</p>
          <p className="font-medium text-[#111827]">{donorInfo.fullName}</p>
          <p className="text-sm text-[#6B7280]">{donorInfo.email}</p>
        </div>

        {/* Payment Method */}
        <div className="mb-6 p-4 bg-[#F6F7FB] rounded-[10px]">
          <p className="text-sm text-[#6B7280] mb-1">Método de pago</p>
          <p className="font-medium text-[#111827]">
            {paymentMethodNames[paymentMethod]}
          </p>
        </div>

        {/* Items */}
        <div className="mb-4">
          <p className="text-sm text-[#6B7280] mb-3">Conceptos</p>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-[#F6F7FB] rounded-[8px]"
              >
                <div>
                  <p className="text-sm font-medium text-[#111827]">
                    {item.causeName}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-[#6B7280]">
                      Cantidad: {item.quantity}
                    </p>
                  )}
                </div>
                <p className="font-medium text-[#4E5BFF]">
                  {formatAmount(item.amount * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-[#ECEEF3] pt-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#6B7280]">Total donado</span>
            <span className="text-2xl font-bold text-[#111827]">
              {formatAmount(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onDownload}
          className="flex-1 py-3.5 px-4 bg-white border-2 border-[#E5E7EB] hover:border-[#4E5BFF] text-[#374151] hover:text-[#4E5BFF] rounded-[10px] font-semibold transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Descargar comprobante
        </button>
        <button
          onClick={onFinish}
          className="flex-1 py-3.5 px-4 bg-[#4E5BFF] hover:bg-[#3F46DB] text-white rounded-[10px] font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          Finalizar
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
