import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4 px-6">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={stepNum} className="flex items-center">
            {/* Circle */}
            <div
              className={
                isCompleted
                  ? 'w-8 h-8 rounded-full bg-vibrantGreen flex items-center justify-center transition-all duration-300'
                  : isActive
                    ? 'w-8 h-8 rounded-full bg-vibrantGreen flex items-center justify-center transition-all duration-300 shadow-[0_0_12px_rgba(0,200,83,0.4)]'
                    : 'w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.15)] flex items-center justify-center transition-all duration-300'
              }
            >
              {isCompleted ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <span
                  className={
                    isActive
                      ? 'text-xs font-semibold text-white'
                      : 'text-xs font-medium text-[#64748B]'
                  }
                >
                  {stepNum}
                </span>
              )}
            </div>

            {/* Connecting line */}
            {stepNum < totalSteps && (
              <div className="w-6 h-0.5 mx-1 rounded-full overflow-hidden bg-[#1E293B]">
                <div
                  className="h-full rounded-full bg-vibrantGreen transition-all duration-500"
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
