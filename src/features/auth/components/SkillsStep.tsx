"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillsSchema } from "../lib/validations";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Props {
  onComplete: (skills: string[]) => Promise<void>;
}

type SkillsFormValues = {
  skills: string[];
};

export function SkillsStep({ onComplete }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SkillsFormValues>({
    resolver: zodResolver(skillsSchema),
    defaultValues: { skills: [""] },
  });

  const skills = watch("skills");

  const onSubmit = async (data: SkillsFormValues) => {
    const filtered = data.skills.filter((s) => s.trim() !== "");
    try {
      await onComplete(filtered);
    } catch (error) {
      // Error is handled by parent component via toast
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="text-2xl font-semibold font-[var(--font-cormorant-sc)]">
        Your Skills
      </h2>
      <p className="text-sm text-neutral-600">Add skills relevant to your work.</p>

      {skills.map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            {...register(`skills.${index}` as const)}
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-neutral-50"
            placeholder="e.g., Marketing, Python"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() =>
              setValue(
                "skills",
                skills.filter((__, i) => i !== index),
                { shouldDirty: true, shouldTouch: true, shouldValidate: true }
              )
            }
            className="p-1 text-neutral-400 hover:text-red-500 transition disabled:opacity-50"
            disabled={isSubmitting}
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          setValue("skills", [...skills, ""], {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
        }
        className="text-sm text-cyan-600 hover:text-cyan-700 font-medium disabled:opacity-50"
        disabled={isSubmitting}
      >
        + Add another
      </button>

      {errors.skills && (
        <p className="text-red-500 text-xs">{errors.skills.message as string}</p>
      )}

      <Button
        type="submit"
        variant="primary-gradient"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving skills..." : "Complete Setup"}
      </Button>
    </form>
  );
}