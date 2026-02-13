import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Stepper,
  CategoryTabs,
  DonationTypeContainer,
  CartPanel,
  ConfirmationPanel,
  useDonationStore,
  useDonationProcessor,
  type ProcessResult,
} from '@/features/donation';
import {
  PaymentMethodCard,
  CreditCardForm,
  PSEForm,
  usePaymentStore,
  PaymentMethod,
} from '@/features/payment';
import { DonorForm, useDonorStore, type DonorInfo } from '@/features/donor';
import { donationsService } from '@/shared/lib/api';
import logoSabanaNorte from '@/shared/assets/db28b6f2afc4257aa2f0341a5d2855a92eaf3105.png';
import { formatCurrency } from '@/shared/lib/utils';

export function HomePage() {
  // Callback handling for redirect payments (Bancolombia, PSE)
  const [searchParams, setSearchParams] = useSearchParams();
  const [callbackData, setCallbackData] = useState<{
    donorInfo: DonorInfo;
    paymentMethod: PaymentMethod;
    items: { id: string; causeId: string; causeName: string; type: 'MOTIVE' | 'PROJECT' | 'EVENT'; amount: number; quantity: number }[];
    result: ProcessResult;
  } | null>(null);
  const [isLoadingCallback, setIsLoadingCallback] = useState(false);

  // Donation store
  const {
    causes,
    causesLoading,
    causesError,
    cart,
    currency,
    currentStep,
    activeTab,
    loadCauses,
    addToCart,
    removeFromCart,
    setCurrency,
    setStep,
    setActiveTab,
    getCauseById,
    getFilteredCauses,
    reset: resetDonation,
  } = useDonationStore();

  // Load causes on mount
  useEffect(() => {
    if (causes.length === 0 && !causesLoading) {
      loadCauses();
    }
  }, [causes.length, causesLoading, loadCauses]);

  // Handle payment callback (Bancolombia, PSE redirects)
  useEffect(() => {
    const donationId = searchParams.get('donation');
    if (!donationId || callbackData || isLoadingCallback) return;

    const loadCallbackData = async () => {
      setIsLoadingCallback(true);
      try {
        const donation = await donationsService.getByIdForCallback(donationId);

        // Map donation status to ProcessResult status
        const statusMap: Record<string, 'APPROVED' | 'PENDING' | 'PROCESSING' | 'DECLINED'> = {
          COMPLETED: 'APPROVED',
          PENDING: 'PENDING',
          PROCESSING: 'PROCESSING',
          FAILED: 'DECLINED',
          REFUNDED: 'DECLINED',
        };

        // Reconstruct data from donation
        const reconstructedDonorInfo: DonorInfo = {
          fullName: donation.donor?.full_name || '',
          email: donation.donor?.email || '',
          phone: '',
          documentType: 'CC',
          documentNumber: '',
        };

        const reconstructedItems = donation.items?.map((item, index) => ({
          id: `callback-${index}`,
          causeId: item.cause_id || '',
          causeName: item.cause_name,
          type: item.cause_type as 'MOTIVE' | 'PROJECT' | 'EVENT',
          amount: item.amount,
          quantity: item.quantity,
        })) || [];

        const reconstructedResult: ProcessResult = {
          type: donation.payment_method === 'BANCOLOMBIA_BUTTON' ? 'bancolombia' :
                donation.payment_method === 'PSE' ? 'pse' : 'card',
          status: statusMap[donation.status] || 'PROCESSING',
          donation: {
            data: {
              id: donation.id,
              status: donation.status,
              total_amount: donation.total_amount,
              currency: donation.currency,
              payment_method: donation.payment_method,
              wompi_reference: donation.wompi_reference,
              paid_at: donation.paid_at,
              items: donation.items || [],
              items_count: donation.items_count,
              donor: donation.donor,
              prayer_request: donation.prayer_request,
              created_at: donation.created_at,
            },
          },
          payment: {
            status: statusMap[donation.status] || 'PROCESSING',
            donation_id: donation.id,
            wompi_transaction_id: donation.wompi_transaction_id,
            message: '',
          },
        };

        setCallbackData({
          donorInfo: reconstructedDonorInfo,
          paymentMethod: donation.payment_method as PaymentMethod,
          items: reconstructedItems,
          result: reconstructedResult,
        });

        // Set to step 4
        setStep(4);

        // Clear the URL params
        setSearchParams({});

      } catch (err) {
        console.error('Error loading callback data:', err);
        toast.error('Error al cargar los datos de la donación');
      } finally {
        setIsLoadingCallback(false);
      }
    };

    loadCallbackData();
  }, [searchParams, callbackData, isLoadingCallback, setStep, setSearchParams]);

  // Payment store
  const {
    selectedMethod,
    cardData,
    pseData,
    selectMethod,
    setCardData,
    reset: resetPayment,
  } = usePaymentStore();

  // Donation processor
  const {
    processDonation,
    isProcessing,
    error: processingError,
    result: donationResult,
    reset: resetProcessor,
  } = useDonationProcessor();

  // Processing state for UI
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-scroll ref for payment forms
  const paymentFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedMethod && currentStep === 2 && paymentFormRef.current) {
      const timer = setTimeout(() => {
        paymentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [selectedMethod, currentStep]);

  // Donor store
  const {
    donorInfo,
    setDonorInfo,
    reset: resetDonor,
  } = useDonorStore();

  const steps = [
    {
      number: 1,
      title: 'Detalle de la donación',
      status:
        currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'waiting',
    },
    {
      number: 2,
      title: 'Método de donación',
      status:
        currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'waiting',
    },
    {
      number: 3,
      title: 'Datos del donante',
      status:
        currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'waiting',
    },
    {
      number: 4,
      title: 'Confirmación',
      status:
        currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'waiting',
    },
  ] as const;

  const filteredCauses = getFilteredCauses();

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber <= currentStep) {
      setStep(stepNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (causeId: string, amount: number, quantity: number) => {
    const cause = getCauseById(causeId);
    if (!cause) return;

    addToCart({
      causeId,
      causeName: cause.name,
      type: cause.type,
      amount,
      quantity,
    });

    toast.success('Donación agregada al resumen', {
      description: `${cause.name} - ${formatCurrency(amount * quantity, currency)}`,
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    removeFromCart(itemId);
    toast.info('Donación eliminada del resumen');
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Agrega al menos una donación para continuar');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentMethodSelect = () => {
    if (!selectedMethod) {
      toast.error('Por favor selecciona un método de donación');
      return;
    }

    // Validate credit card fields
    if (selectedMethod === 'CREDIT_CARD') {
      if (!cardData?.cardHolder?.trim()) {
        toast.error('Por favor ingresa el nombre del titular de la tarjeta');
        return;
      }
      if (!cardData?.cardNumber || cardData.cardNumber.replace(/\s/g, '').length < 13) {
        toast.error('Por favor ingresa un número de tarjeta válido');
        return;
      }
      if (!cardData?.expiryDate || cardData.expiryDate.length < 5) {
        toast.error('Por favor ingresa la fecha de expiración');
        return;
      }
      if (!cardData?.cvv || cardData.cvv.length < 3) {
        toast.error('Por favor ingresa el CVV');
        return;
      }
    }

    // Validate PSE fields
    if (selectedMethod === 'PSE') {
      if (!pseData?.bankCode) {
        toast.error('Por favor selecciona un banco');
        return;
      }
      if (!pseData?.documentNumber?.trim()) {
        toast.error('Por favor ingresa tu número de documento');
        return;
      }
    }

    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDonorInfoSubmit = async (info: DonorInfo) => {
    if (!info || !selectedMethod) return;

    setDonorInfo(info);
    setIsSubmitting(true);

    try {
      const result = await processDonation({
        cart,
        currency,
        paymentMethod: selectedMethod,
        donorInfo: info,
        cardData,
        pseData,
        prayerRequest: info.prayerRequest,
      });

      // For PSE or Bancolombia, show confirmation then redirect
      if (result.type === 'pse' || result.type === 'bancolombia') {
        setStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (result.redirectUrl) {
          const message = result.type === 'bancolombia'
            ? 'Redirigiendo a Bancolombia...'
            : 'Redirigiendo al banco...';
          toast.info(message, {
            description: 'Serás redirigido para completar la donación',
          });
          // Redirect after brief delay to show confirmation
          setTimeout(() => {
            window.location.href = result.redirectUrl!;
          }, 2000);
        }
        return;
      }

      // For card payments, check result
      if (result.status === 'APPROVED' || result.status === 'PENDING' || result.status === 'PROCESSING') {
        if (result.status === 'PENDING') {
          toast.info('Donación en proceso', {
            description: 'Tu donación está siendo procesada. Te notificaremos cuando se complete.',
          });
        }
        setStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error('Donación rechazada', {
          description: result.payment?.message || 'Tu donación no fue aprobada. Por favor intenta con otro método.',
        });
      }
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Error al procesar la donación';
      toast.error('Error', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceipt = async () => {
    const donationId = callbackData?.result.donation.data.id || donationResult?.donation.data.id;
    if (!donationId) {
      toast.error('No se encontró la donación');
      return;
    }

    toast.success('Descargando comprobante...', {
      description: 'Tu comprobante se está generando',
    });

    // The download is handled by the service opening a new tab
    const { donationsService } = await import('@/shared/lib/api');
    await donationsService.downloadReceipt(donationId);
  };

  const handleFinish = () => {
    setCallbackData(null);
    resetDonation();
    resetPayment();
    resetDonor();
    resetProcessor();
    toast.success('¡Gracias por tu donación!', {
      description: 'Esperamos verte pronto',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] py-8 pb-32 lg:pb-8 overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-6">
            <img
              src={logoSabanaNorte}
              alt="Sabana Norte"
              className="h-10 w-auto"
            />
            <div className="border-l border-[#E5E7EB] pl-3 ml-1">
              <p className="text-sm text-[#6B7280]">Sistema de donaciones</p>
            </div>
          </div>

          <Stepper steps={[...steps]} onStepClick={handleStepClick} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Donation Details */}
            {currentStep === 1 && (
              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
                <div className="mb-6">
                  <h2 className="text-[#111827] mb-2">Detalle de la donación</h2>
                  <p className="text-[#6B7280]">
                    Selecciona el tipo de donación y el valor que quieres donar.
                  </p>
                </div>

                {causesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E5BFF]"></div>
                    <span className="ml-3 text-[#6B7280]">Cargando causas...</span>
                  </div>
                ) : causesError ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 mb-4">{causesError}</p>
                    <button
                      onClick={() => loadCauses()}
                      className="px-4 py-2 bg-[#4E5BFF] text-white rounded-lg hover:bg-[#3F46DB]"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : (
                  <>
                    <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    <DonationTypeContainer
                      type={activeTab}
                      causes={filteredCauses}
                      onAdd={handleAddToCart}
                      onCurrencyChange={setCurrency}
                    />
                  </>
                )}
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 &&
              (() => {
                // Order: 1. Credit/Debit Card, 2. Bancolombia Button (COP only), 3. PSE (disabled)
                const availableMethods: { method: PaymentMethod; disabled?: boolean; disabledText?: string }[] =
                  currency === 'COP'
                    ? [
                        { method: 'CREDIT_CARD' },
                        { method: 'BANCOLOMBIA_BUTTON' },
                        { method: 'PSE', disabled: true, disabledText: 'Próximamente' },
                      ]
                    : [{ method: 'CREDIT_CARD' }];

                return (
                  <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-4 sm:p-6 lg:p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
                    <div className="mb-6">
                      <h2 className="text-[#111827] mb-2">Método de donación</h2>
                      <p className="text-[#6B7280]">
                        Selecciona cómo deseas realizar tu donación.
                      </p>
                    </div>

                    <div className="space-y-3 mb-8">
                      {availableMethods.map(({ method, disabled, disabledText }) => (
                        <PaymentMethodCard
                          key={method}
                          method={method}
                          selected={selectedMethod === method}
                          onSelect={() => selectMethod(method)}
                          disabled={disabled}
                          disabledText={disabledText}
                        />
                      ))}
                    </div>

                    {/* Payment Method Forms */}
                    <div ref={paymentFormRef}>
                    {selectedMethod === 'CREDIT_CARD' && <CreditCardForm onDataChange={setCardData} />}
                    {selectedMethod === 'PSE' && <PSEForm />}
                    {selectedMethod === 'BANCOLOMBIA_BUTTON' && (
                      <div className="bg-[#F6F7FB] rounded-lg p-4 text-sm text-[#6B7280]">
                        <p>Serás redirigido a tu app de Bancolombia para completar la donación.</p>
                      </div>
                    )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                      <button
                        onClick={() => setStep(1)}
                        className="w-full sm:flex-1 py-3 px-4 bg-white border-2 border-[#E5E7EB] hover:border-[#4E5BFF] text-[#374151] rounded-[10px] font-medium transition-all duration-200"
                      >
                        Volver
                      </button>
                      <button
                        onClick={handlePaymentMethodSelect}
                        className="w-full sm:flex-1 py-3 px-4 bg-[#4E5BFF] hover:bg-[#3F46DB] text-white rounded-[10px] font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Continuar
                      </button>
                    </div>
                  </div>
                );
              })()}

            {/* Step 3: Donor Info */}
            {currentStep === 3 && (
              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-4 sm:p-6 lg:p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
                <div className="mb-6">
                  <h2 className="text-[#111827] mb-2">Datos del donante</h2>
                  <p className="text-[#6B7280]">
                    Por favor completa tu información para procesar la donación.
                  </p>
                </div>

                <DonorForm onSubmit={handleDonorInfoSubmit} isLoading={isSubmitting || isProcessing} />

                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-4 py-3 px-4 bg-white border-2 border-[#E5E7EB] hover:border-[#4E5BFF] text-[#374151] rounded-[10px] font-medium transition-all duration-200"
                >
                  Volver
                </button>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && isLoadingCallback && (
              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E5BFF] mb-4"></div>
                  <p className="text-[#6B7280]">Verificando tu donación...</p>
                </div>
              </div>
            )}
            {currentStep === 4 && !isLoadingCallback && (callbackData || (donorInfo && selectedMethod)) && (
              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
                <ConfirmationPanel
                  items={callbackData?.items || cart}
                  donorInfo={callbackData?.donorInfo || donorInfo!}
                  paymentMethod={callbackData?.paymentMethod || selectedMethod!}
                  donationResult={callbackData?.result || donationResult}
                  onDownload={handleDownloadReceipt}
                  onFinish={handleFinish}
                />
              </div>
            )}
          </div>

          {/* Right Column - Cart Panel */}
          <div className="lg:col-span-1">
            <CartPanel
              items={cart}
              onRemoveItem={handleRemoveFromCart}
              onCheckout={handleCheckout}
              showCheckoutButton={currentStep === 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
