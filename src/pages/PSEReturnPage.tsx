import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { donationsService } from '@/shared/lib/api';
import type { Donation } from '@/shared/lib/api';
import logoSabanaNorte from '@/shared/assets/db28b6f2afc4257aa2f0341a5d2855a92eaf3105.png';

type PageStatus = 'loading' | 'success' | 'pending' | 'failed' | 'error';

const statusConfig = {
  loading: {
    icon: RefreshCw,
    color: 'text-[#4E5BFF]',
    bgColor: 'bg-[#4E5BFF]/10',
    title: 'Verificando donación...',
    description: 'Estamos confirmando el estado de tu donación con el banco.',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-[#22C55E]',
    bgColor: 'bg-[#22C55E]/10',
    title: '¡Donación exitosa!',
    description: 'Tu donación ha sido procesada correctamente. Gracias por tu generosidad.',
  },
  pending: {
    icon: Clock,
    color: 'text-[#F59E0B]',
    bgColor: 'bg-[#F59E0B]/10',
    title: 'Donación en proceso',
    description: 'Tu donación está siendo procesada. Te notificaremos cuando se complete.',
  },
  failed: {
    icon: XCircle,
    color: 'text-[#EF4444]',
    bgColor: 'bg-[#EF4444]/10',
    title: 'Donación no completada',
    description: 'Lo sentimos, tu donación no pudo ser procesada. Por favor intenta nuevamente.',
  },
  error: {
    icon: XCircle,
    color: 'text-[#EF4444]',
    bgColor: 'bg-[#EF4444]/10',
    title: 'Error al verificar',
    description: 'No pudimos verificar el estado de tu donación. Por favor contacta soporte.',
  },
};

export function PSEReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PageStatus>('loading');
  const [donation, setDonation] = useState<Donation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const donationId = searchParams.get('donation');

  useEffect(() => {
    async function checkDonationStatus() {
      if (!donationId) {
        setStatus('error');
        setErrorMessage('No se encontró referencia de donación');
        return;
      }

      try {
        const donationData = await donationsService.getByIdForCallback(donationId);
        setDonation(donationData);

        // Map donation status to page status
        switch (donationData.status) {
          case 'COMPLETED':
            setStatus('success');
            break;
          case 'PENDING':
          case 'PROCESSING':
            setStatus('pending');
            break;
          case 'FAILED':
          case 'REFUNDED':
            setStatus('failed');
            break;
          default:
            setStatus('pending');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage((err as { message?: string })?.message || 'Error al verificar donación');
      }
    }

    checkDonationStatus();
  }, [donationId]);

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleNewDonation = () => {
    navigate('/');
  };

  const handleRetry = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <img src={logoSabanaNorte} alt="Sabana Norte" className="h-10 w-auto" />
          <div className="border-l border-[#E5E7EB] pl-3 ml-1">
            <p className="text-sm text-[#6B7280]">Confirmación de donación PSE</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
          {/* Status Icon */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 ${config.bgColor} rounded-full mb-6`}
            >
              <StatusIcon
                className={`w-12 h-12 ${config.color} ${status === 'loading' ? 'animate-spin' : ''}`}
              />
            </div>
            <h2 className="text-[#111827] text-2xl font-bold mb-2">{config.title}</h2>
            <p className="text-[#6B7280]">{config.description}</p>
            {errorMessage && <p className="text-[#EF4444] mt-2 text-sm">{errorMessage}</p>}
          </div>

          {/* Donation Details */}
          {donation && (
            <div className="space-y-4 mb-8">
              {/* Reference */}
              {donation.wompi_reference && (
                <div className="p-4 bg-[#EEF0FF] rounded-[10px] border border-[#4E5BFF]/20">
                  <p className="text-sm text-[#6B7280] mb-1">Referencia de donación</p>
                  <p className="font-mono font-bold text-[#4E5BFF] text-lg">
                    {donation.wompi_reference}
                  </p>
                </div>
              )}

              {/* Donor Info */}
              {donation.donor && (
                <div className="p-4 bg-[#F6F7FB] rounded-[10px]">
                  <p className="text-sm text-[#6B7280] mb-1">Donante</p>
                  <p className="font-medium text-[#111827]">{donation.donor.full_name}</p>
                  <p className="text-sm text-[#6B7280]">{donation.donor.email}</p>
                </div>
              )}

              {/* Items */}
              {donation.items && donation.items.length > 0 && (
                <div>
                  <p className="text-sm text-[#6B7280] mb-3">Conceptos</p>
                  <div className="space-y-2">
                    {donation.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#F6F7FB] rounded-[8px]"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#111827]">{item.cause_name}</p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-[#6B7280]">Cantidad: {item.quantity}</p>
                          )}
                        </div>
                        <p className="font-medium text-[#4E5BFF]">{formatAmount(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-[#ECEEF3] pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#6B7280]">Total</span>
                  <span className="text-2xl font-bold text-[#111827]">
                    {formatAmount(donation.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            {status === 'failed' || status === 'error' ? (
              <button
                onClick={handleRetry}
                className="w-full py-3.5 px-4 bg-[#4E5BFF] hover:bg-[#3F46DB] text-white rounded-[10px] font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                Intentar de nuevo
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : status !== 'loading' ? (
              <button
                onClick={handleNewDonation}
                className="w-full py-3.5 px-4 bg-[#4E5BFF] hover:bg-[#3F46DB] text-white rounded-[10px] font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                Hacer otra donación
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#6B7280]">
            ¿Tienes algún problema?{' '}
            <a href="mailto:soporte@mcisabananorte.com" className="text-[#4E5BFF] hover:underline">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
