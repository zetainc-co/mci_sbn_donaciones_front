import { useEffect, useState } from 'react';
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
import logoSabanaNorte from '@/shared/assets/db28b6f2afc4257aa2f0341a5d2855a92eaf3105.png';
import { formatCurrency } from '@/shared/lib/utils';

export function HomePage() {
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
      toast.error('Por favor selecciona un método de pago');
      return;
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

      // For PSE, show confirmation then redirect to bank
      if (result.type === 'pse') {
        setStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (result.redirectUrl) {
          toast.info('Redirigiendo al banco...', {
            description: 'Serás redirigido para completar el pago',
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
          toast.info('Pago en proceso', {
            description: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
          });
        }
        setStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error('Pago rechazado', {
          description: result.payment?.message || 'Tu pago no fue aprobado. Por favor intenta con otro método.',
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
    if (!donationResult?.donation.data.id) {
      toast.error('No se encontró la donación');
      return;
    }

    toast.success('Descargando comprobante...', {
      description: 'Tu comprobante se está generando',
    });

    // The download is handled by the service opening a new tab
    const { donationsService } = await import('@/shared/lib/api');
    await donationsService.downloadReceipt(donationResult.donation.data.id);
  };

  const handleFinish = () => {
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
    <div className="min-h-screen bg-[#F6F7FB] py-8 pb-32 lg:pb-8">
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
                const availableMethods: PaymentMethod[] =
                  currency === 'COP' ? ['CREDIT_CARD', 'PSE'] : ['CREDIT_CARD'];

                return (
                  <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-4 sm:p-6 lg:p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
                    <div className="mb-6">
                      <h2 className="text-[#111827] mb-2">Método de donación</h2>
                      <p className="text-[#6B7280]">
                        Selecciona cómo deseas realizar tu donación.
                      </p>
                    </div>

                    <div className="space-y-3 mb-8">
                      {availableMethods.map((method) => (
                        <PaymentMethodCard
                          key={method}
                          method={method}
                          selected={selectedMethod === method}
                          onSelect={() => selectMethod(method)}
                        />
                      ))}
                    </div>

                    {/* Payment Method Forms */}
                    {selectedMethod === 'CREDIT_CARD' && <CreditCardForm onDataChange={setCardData} />}
                    {selectedMethod === 'PSE' && <PSEForm />}

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
            {currentStep === 4 && donorInfo && selectedMethod && (
              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
                <ConfirmationPanel
                  items={cart}
                  donorInfo={donorInfo}
                  paymentMethod={selectedMethod}
                  donationResult={donationResult}
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
