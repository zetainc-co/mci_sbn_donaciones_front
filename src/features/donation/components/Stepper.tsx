import { Check } from 'lucide-react';
import { Step } from '../types';

interface StepperProps {
  steps: Step[];
  onStepClick?: (stepNumber: number) => void;
}

export function Stepper({ steps, onStepClick }: StepperProps) {
  return (
    <div className="mb-8">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-start justify-between gap-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-start gap-2 flex-1">
            {/* Step Content */}
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {/* Step Circle */}
                <div className="flex flex-col items-center relative">
                  <button
                    onClick={() => onStepClick?.(step.number)}
                    disabled={step.status === 'waiting'}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 relative z-10
                      ${
                        step.status === 'completed'
                          ? 'bg-[#4E5BFF] text-white shadow-[0px_2px_8px_rgba(78,91,255,0.2)] cursor-pointer hover:shadow-[0px_2px_12px_rgba(78,91,255,0.3)] hover:scale-105'
                          : step.status === 'current'
                          ? 'bg-[#4E5BFF] text-white shadow-[0px_2px_10px_rgba(78,91,255,0.35)] cursor-pointer ring-4 ring-[#EEF0FF]'
                          : 'bg-white border-2 border-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                      }
                    `}
                  >
                    {step.status === 'completed' ? (
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                    ) : (
                      <span className="text-xs font-semibold">{step.number}</span>
                    )}
                  </button>

                  {/* Step Title */}
                  <div className="mt-3 text-center max-w-[120px]">
                    <p
                      className={`
                        text-xs transition-colors duration-300 leading-snug
                        ${
                          step.status === 'current'
                            ? 'text-[#111827] font-medium'
                            : step.status === 'completed'
                            ? 'text-[#374151] font-medium'
                            : 'text-[#9CA3AF]'
                        }
                      `}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-[2px] mb-6 mx-3 relative">
                    <div className="absolute inset-0 bg-[#E5E7EB] rounded-full" />
                    <div
                      className={`
                        absolute inset-0 bg-[#4E5BFF] rounded-full transition-all duration-500 ease-out
                        ${step.status === 'completed' ? 'w-full' : 'w-0'}
                      `}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                  ${
                    step.status === 'completed'
                      ? 'bg-[#4E5BFF] text-white cursor-pointer hover:scale-110'
                      : step.status === 'current'
                      ? 'bg-[#4E5BFF] text-white cursor-pointer'
                      : 'bg-white border-2 border-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  }
                `}
                onClick={() => onStepClick?.(step.number)}
              >
                {step.status === 'completed' ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <span className="text-xs font-semibold">{step.number}</span>
                )}
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 relative">
                  <div className="absolute inset-0 bg-[#E5E7EB] rounded-full" />
                  <div
                    className={`
                      absolute inset-0 bg-[#4E5BFF] rounded-full transition-all duration-500
                      ${step.status === 'completed' ? 'w-full' : 'w-0'}
                    `}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Current Step Title (Mobile) */}
        <div className="text-center">
          <p className="text-sm font-medium text-[#111827]">
            {steps.find((s) => s.status === 'current')?.title}
          </p>
        </div>
      </div>
    </div>
  );
}
