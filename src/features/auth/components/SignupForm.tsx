"use client";
import { useSignup } from "../hooks/useSignup";
import { ProgressBar } from "./ProgressBar";
import { AccountStep } from "./AccountStep";
import { OTPVerification } from "./OTPVerification";
import { QuestionnaireStep } from "./QuestionnaireStep";
import { SkillsStep } from "./SkillsStep";
import { SuccessStep } from "./SuccessStep";

export function SignupForm() {
  const { step, email, handleStep1, handleOtp, handleQuestionnaire, handleSkills } = useSignup();

  return (
    <div className="space-y-6">
      {step < 5 && <ProgressBar currentStep={step} />}
      {step === 1 && <AccountStep onNext={handleStep1} />}
      {step === 2 && <OTPVerification onVerify={handleOtp} email={email} />}
      {step === 3 && <QuestionnaireStep onNext={handleQuestionnaire} />}
      {step === 4 && <SkillsStep onComplete={handleSkills} />}
      {step === 5 && <SuccessStep />}
    </div>
  );
}