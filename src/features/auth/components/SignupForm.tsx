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
    <div className="flex items-start w-full mb-6">
      {steps.map((step, i) => {
        const isActive = step.number === currentStep;
        const isPast = step.number < currentStep;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.number} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors shrink-0",
                  isActive && "bg-amber-500 text-white",
                  isPast && "bg-cyan-500 text-white",
                  !isActive && !isPast && "bg-gray-200 text-gray-500"
                )}
              >
                {isPast ? <Check size={12} strokeWidth={2.5} /> : step.number}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  isActive && "text-amber-500",
                  isPast && "text-cyan-500",
                  !isActive && !isPast && "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div className="flex-1 flex items-center pt-3 px-2">
                <div className={cn("w-full h-0.5 transition-colors", isPast ? "bg-cyan-500" : "bg-gray-200")} />
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
    <div className="space-y-0">
      {step < 5 && <ProgressStepper currentStep={step} steps={steps} />}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 sm:p-6">
        {step === 1 && <AccountStep onNext={handleStep1} />}
        {step === 2 && <OTPVerification onVerify={handleOtp} email={email} />}
        {step === 3 && <QuestionnaireStep onNext={handleQuestionnaire} />}
        {step === 4 && <SkillsStep onComplete={handleSkills} />}
        {step === 5 && <SuccessStep />}
      </div>
    </div>
  );
}
