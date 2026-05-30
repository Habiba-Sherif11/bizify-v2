"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSignup } from "../hooks/useSignup";
import { AccountStep } from "./AccountStep";
import { OTPVerification } from "./OTPVerification";
import { QuestionnaireStep } from "./QuestionnaireStep";
import { SkillsStep } from "./SkillsStep";
import { SuccessStep } from "./SuccessStep";

const ENTREPRENEUR_STEPS = [
  { number: 1, label: "Account" },
  { number: 2, label: "Verify" },
  { number: 3, label: "About you" },
  { number: 4, label: "Skills" },
];

const PARTNER_STEPS = [
  { number: 1, label: "Account" },
  { number: 2, label: "Verify" },
];

type Step = { number: number; label: string };

function ProgressStepper({ currentStep, steps }: { currentStep: number; steps: Step[] }) {
  return (
    <div className="flex items-start w-full">
      {steps.map((step, i) => {
        const isActive = step.number === currentStep;
        const isPast = step.number < currentStep;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.number} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all shrink-0 ring-2 ring-offset-1",
                  isActive && "bg-amber-500 text-white ring-amber-200",
                  isPast && "bg-[#0891B2] text-white ring-cyan-100",
                  !isActive && !isPast && "bg-[#E9E9E9] text-[#8C8C8C] ring-transparent"
                )}
              >
                {isPast ? <Check size={13} strokeWidth={2.5} /> : step.number}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap leading-none",
                  isActive && "text-amber-500",
                  isPast && "text-[#0891B2]",
                  !isActive && !isPast && "text-[#8C8C8C]"
                )}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div className="flex-1 flex items-center pt-3.5 px-1.5">
                <div
                  className={cn(
                    "w-full h-px transition-colors",
                    isPast ? "bg-[#0891B2]" : "bg-[#E9E9E9]"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SignupForm() {
  const { step, email, selectedRole, handleStep1, handleOtp, handleQuestionnaire, handleSkills } = useSignup();

  const steps = selectedRole === "entrepreneur" || selectedRole === null
    ? ENTREPRENEUR_STEPS
    : PARTNER_STEPS;

  return (
    <div className="space-y-4">
      {step < 5 && (
        <>
          <ProgressStepper currentStep={step} steps={steps} />
          <div className="h-px bg-black/[0.05] -mx-6" />
        </>
      )}

      <div>
        {step === 1 && <AccountStep onNext={handleStep1} />}
        {step === 2 && <OTPVerification onVerify={handleOtp} email={email} />}
        {step === 3 && <QuestionnaireStep onNext={handleQuestionnaire} />}
        {step === 4 && <SkillsStep onComplete={handleSkills} />}
        {step === 5 && <SuccessStep />}
      </div>
    </div>
  );
}
