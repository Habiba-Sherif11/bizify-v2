"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "./ChatBubble";
import { ChoiceButton } from "./ChoiceButton";
import questionnaireData from "../data/questionnaire.json";

interface Question {
  field: string;
  question: string;
  multi: boolean;
  choices: string[];
  label?: string;
}

interface ChatMessage {
  role: "ai" | "user";
  text: string;
}

interface Props {
  onNext: (
    payload: { field: string; question: string; multi: boolean; choices: string[]; label: string }[]
  ) => Promise<void> | void;
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#8C8C8C]">
          {current < total ? `Question ${current + 1} of ${total}` : "You're all set"}
        </span>
        <span className="text-[11px] font-semibold text-amber-500">{pct}%</span>
      </div>
      <div className="h-0.75 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const WELCOME =
  "Hi! I'm your AI co-founder. A few questions to personalize your experience. It'll only take a minute.";

export function QuestionnaireStep({ onNext }: Props) {
  const questions = questionnaireData as Question[];

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([
    { role: "ai", text: WELCOME },
    { role: "ai", text: questions[0].question },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDone = currentQ >= questions.length;
  const currentQuestion = questions[currentQ];
  const isMulti = currentQuestion?.multi ?? false;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [history]);

  const advance = (choices: string[]) => {
    const q = questions[currentQ];
    const newAnswers = { ...answers, [q.field]: choices };
    setAnswers(newAnswers);
    setSelected([]);

    const displayText = choices.join(", ");
    const next = currentQ + 1;

    if (next < questions.length) {
      setHistory((h) => [
        ...h,
        { role: "user", text: displayText },
        { role: "ai", text: questions[next].question },
      ]);
      setCurrentQ(next);
    } else {
      setHistory((h) => [
        ...h,
        { role: "user", text: displayText },
        {
          role: "ai",
          text: "Perfect! I've got everything I need. Let's move on to your skills.",
        },
      ]);
      setCurrentQ(questions.length);
    }
  };

  const handleSingle = (choice: string) => {
    if (isDone) return;
    advance([choice]);
  };

  const toggleMulti = (choice: string) => {
    setSelected((prev) =>
      prev.includes(choice) ? prev.filter((c) => c !== choice) : [...prev, choice]
    );
  };

  const handleContinue = async () => {
    if (isDone) {
      setIsSubmitting(true);
      const payload = questions.map((q) => ({
        field: q.field,
        question: q.question,
        multi: q.multi,
        choices: answers[q.field] ?? [],
        label: q.label ?? "",
      }));
      try {
        await onNext(payload);
      } finally {
        setIsSubmitting(false);
      }
    } else if (isMulti && selected.length > 0) {
      advance(selected);
    }
  };

  return (
    <div className="flex flex-col gap-4" style={{ minHeight: 400 }}>
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-[#1C1C1E]">A few quick questions</h2>
        <p className="text-sm text-[#8C8C8C] mt-0.5">Help your AI co-founder understand you</p>
      </div>

      {/* Progress */}
      <ProgressBar current={currentQ} total={questions.length} />

      {/* Chat history */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-3.5 overflow-y-auto flex-1 pr-0.5 scroll-smooth"
        style={{ maxHeight: 300, minHeight: 180 }}
      >
        {history.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} text={msg.text} />
        ))}
      </div>

      {/* Choice buttons */}
      {!isDone && (
        <div className="flex flex-col gap-2 pt-1">
          {isMulti && (
            <p className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-600 text-[9px] font-bold leading-none">
                +
              </span>
              Select all that apply
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {currentQuestion.choices.map((choice) => (
              <ChoiceButton
                key={choice}
                label={choice}
                selected={isMulti ? selected.includes(choice) : false}
                onClick={() => (isMulti ? toggleMulti(choice) : handleSingle(choice))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Continue / Submit */}
      {(isDone || (isMulti && selected.length > 0)) && (
        <Button
          type="button"
          variant="primary-gradient"
          size="lg"
          className="w-full mt-1"
          disabled={isSubmitting}
          onClick={handleContinue}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </span>
          ) : isDone ? (
            "Continue to Skills"
          ) : (
            "Continue"
          )}
        </Button>
      )}
    </div>
  );
}
