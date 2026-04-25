"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import questionnaireData from "../data/questionnaire.json";

interface Question {
  field: string;
  question: string;
  multi: boolean;
  choices: string[];
  label?: string;
}

export function QuestionnaireStep({
  onNext,
}: {
  onNext: (payload: any[]) => void;
}) {
  const questions = questionnaireData as Question[];

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const onSubmit = (rawData: any) => {
    const payload = questions.map((q) => {
      const value = rawData[q.field];

      let selectedChoices: string[] = [];

      if (q.multi) {
        if (Array.isArray(value)) {
          selectedChoices = value;
        } else if (value) {
          selectedChoices = [value];
        }
      } else {
        if (value) {
          selectedChoices = [value]; // ✅ ALWAYS ARRAY
        }
      }

      return {
        field: q.field,
        question: q.question,
        multi: q.multi,
        choices: selectedChoices, // ✅ FIXED TYPE
        label: q.label || "",
      };
    });

    onNext(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-semibold font-[var(--font-cormorant-sc)]">
        Tell Us About Yourself
      </h2>

      {questions.map((q) => (
        <fieldset key={q.field}>
          <legend className="text-sm font-medium text-neutral-700 mb-2">
            {q.question}
          </legend>

          <div className="grid grid-cols-2 gap-3">
            {q.choices.map((choice) => (
              <label
                key={choice}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 p-3 cursor-pointer hover:bg-amber-50"
              >
                <input
                  {...register(q.field)}
                  type={q.multi ? "checkbox" : "radio"}
                  value={choice}
                  className="accent-amber-500"
                />
                <span className="text-sm">{choice}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <Button
        type="submit"
        variant="primary-gradient"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        Continue
      </Button>
    </form>
  );
}