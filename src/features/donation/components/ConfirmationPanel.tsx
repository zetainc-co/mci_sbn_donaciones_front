import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Download, ArrowRight, Clock, XCircle, RefreshCw } from 'lucide-react';
import { CartItem } from '../types';
import { DonorInfo } from '@/features/donor/types';
import { PaymentMethod } from '@/features/payment/types';
import type { ProcessResult } from '../hooks/useDonationProcessor';
import { donationsService } from '@/shared/lib/api';

interface ConfirmationPanelProps {
  items: CartItem[];
  donorInfo: DonorInfo;
  paymentMethod: PaymentMethod;
  donationResult?: ProcessResult | null;
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

const statusConfig = {
  APPROVED: {
    icon: CheckCircle2,
    color: 'text-[#22C55E]',
    bgColor: 'bg-[#22C55E]/10',
    title: '¡Gracias por tu generosidad!',
    description: 'Tu donación ha sido procesada exitosamente. Has marcado la diferencia.',
    label: 'Aprobado',
  },
  PENDING: {
    icon: Clock,
    color: 'text-[#F59E0B]',
    bgColor: 'bg-[#F59E0B]/10',
    title: 'Donación en proceso',
    description: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
    label: 'Pendiente',
  },
  PROCESSING: {
    icon: RefreshCw,
    color: 'text-[#3B82F6]',
    bgColor: 'bg-[#3B82F6]/10',
    title: 'Verificando tu pago',
    description: 'Estamos confirmando tu pago con la entidad bancaria. Esto puede tomar unos segundos.',
    label: 'Verificando',
  },
  DECLINED: {
    icon: XCircle,
    color: 'text-[#EF4444]',
    bgColor: 'bg-[#EF4444]/10',
    title: 'Pago no aprobado',
    description: 'Lo sentimos, tu pago no fue aprobado. Por favor intenta con otro método.',
    label: 'Rechazado',
  },
};

export function ConfirmationPanel({
  items,
  donorInfo,
  paymentMethod,
  donationResult,
  onDownload,
  onFinish,
}: ConfirmationPanelProps) {
  const [currentStatus, setCurrentStatus] = useState<string>(donationResult?.status || 'PROCESSING');
  const [checkCount, setCheckCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [hasInitialCheck, setHasInitialCheck] = useState(false);

  const maxChecks = 8; // Maximum 8 checks (2 minutes total with 15s intervals)
  const countdownDuration = 15; // 15 seconds between checks

  const wompiReference = donationResult?.donation.data.wompi_reference;

  // Function to check donation status using public endpoint
  const checkDonationStatus = useCallback(async () => {
    if (!wompiReference) return;

    setIsChecking(true);
    try {
      const result = await donationsService.getStatusByReference(wompiReference);

      // Map donation status to ProcessResult status
      const statusMap: Record<string, string> = {
        COMPLETED: 'APPROVED',
        PENDING: 'PENDING',
        PROCESSING: 'PROCESSING',
        FAILED: 'DECLINED',
        REFUNDED: 'DECLINED',
      };

      const newStatus = statusMap[result.status] || result.status;
      setCurrentStatus(newStatus);

      // If still processing/pending, start countdown for next check
      if ((newStatus === 'PROCESSING' || newStatus === 'PENDING') && checkCount < maxChecks) {
        setCountdown(countdownDuration);
      }
    } catch (error) {
      console.error('Error checking donation status:', error);
      // On error, still allow retry
      if (checkCount < maxChecks) {
        setCountdown(countdownDuration);
      }
    } finally {
      setIsChecking(false);
      setCheckCount((prev) => prev + 1);
    }
  }, [wompiReference, checkCount]);

  // Initial check when component mounts
  useEffect(() => {
    if (!hasInitialCheck && wompiReference) {
      setHasInitialCheck(true);
      checkDonationStatus();
    }
  }, [hasInitialCheck, wompiReference, checkDonationStatus]);

  // Countdown timer - decrements every second
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && hasInitialCheck && checkCount > 0 && checkCount < maxChecks) {
      // When countdown reaches 0, trigger another check if status is still pending
      if (currentStatus === 'PROCESSING' || currentStatus === 'PENDING') {
        checkDonationStatus();
      }
    }
  }, [countdown, hasInitialCheck, checkCount, currentStatus, checkDonationStatus]);

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const total = items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  const config = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.PROCESSING;
  const StatusIcon = config.icon;

  const transactionId = donationResult?.payment.wompi_transaction_id;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Status Icon */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 ${config.bgColor} rounded-full mb-6`}>
          <StatusIcon className={`w-12 h-12 ${config.color} ${(currentStatus === 'PROCESSING' || isChecking) ? 'animate-spin' : ''}`} />
        </div>
        <h2 className="text-[#111827] mb-2">{config.title}</h2>
        <p className="text-[#6B7280]">{config.description}</p>

        {/* Verification progress indicator */}
        {(currentStatus === 'PROCESSING' || currentStatus === 'PENDING') && checkCount < maxChecks && (
          <div className="mt-4 p-4 bg-[#F6F7FB] rounded-lg">
            {isChecking ? (
              <div className="flex items-center justify-center gap-2 text-sm text-[#6B7280]">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verificando estado del pago...</span>
              </div>
            ) : countdown > 0 ? (
              <>
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="text-3xl font-bold text-[#4E5BFF] tabular-nums">
                    {countdown}s
                  </div>
                </div>
                <p className="text-sm text-[#6B7280] text-center mb-2">
                  Próxima verificación en {countdown} segundos
                </p>
                <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                  <div
                    className="bg-[#4E5BFF] h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(countdown / countdownDuration) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-[#9CA3AF] text-center mt-2">
                  Intento {checkCount} de {maxChecks}
                </p>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-[#6B7280]">
                <RefreshCw className="w-4 h-4" />
                <span>Preparando verificación...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-6 mb-6 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
        <h3 className="text-[#111827] mb-4">Resumen de tu donación</h3>

        {/* Transaction Reference */}
        {wompiReference && (
          <div className="mb-6 p-4 bg-[#EEF0FF] rounded-[10px] border border-[#4E5BFF]/20">
            <p className="text-sm text-[#6B7280] mb-1">Referencia de transacción</p>
            <p className="font-mono font-bold text-[#4E5BFF] text-lg">{wompiReference}</p>
            {transactionId && (
              <p className="text-xs text-[#6B7280] mt-1">ID Wompi: {transactionId}</p>
            )}
          </div>
        )}

        {/* Status Badge */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-[#6B7280]">Estado:</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
            <StatusIcon className="w-4 h-4" />
            {config.label}
          </span>
        </div>

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
        {currentStatus === 'APPROVED' && (
          <button
            onClick={onDownload}
            className="flex-1 py-3.5 px-4 bg-white border-2 border-[#E5E7EB] hover:border-[#4E5BFF] text-[#374151] hover:text-[#4E5BFF] rounded-[10px] font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Descargar comprobante
          </button>
        )}
        <button
          onClick={onFinish}
          className={`${currentStatus === 'APPROVED' ? 'flex-1' : 'w-full'} py-3.5 px-4 bg-[#4E5BFF] hover:bg-[#3F46DB] text-white rounded-[10px] font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
        >
          {currentStatus === 'DECLINED' ? 'Intentar de nuevo' : 'Finalizar'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
