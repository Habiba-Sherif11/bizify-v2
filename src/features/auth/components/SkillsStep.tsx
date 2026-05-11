"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, Loader2, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "../lib/api";

export type SkillEntry =
  | { predefined_skill_id: string; skill_name?: never }
  | { skill_name: string; predefined_skill_id?: never };

interface Props {
  onComplete: (skills: SkillEntry[]) => Promise<void>;
}

interface PredefinedSkill {
  id: string;
  name: string;
}

interface SkillCategory {
  id: string;
  name: string;
  predefined_skills: PredefinedSkill[];
}

interface SelectedSkill {
  id?: string;
  name: string;
  isCustom: boolean;
}

export function SkillsStep({ onComplete }: Props) {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [allSkills, setAllSkills] = useState<PredefinedSkill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedSkill[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get("/profile/skill-categories")
      .then((res) => {
        const cats = res.data as SkillCategory[];
        setCategories(cats);
        setAllSkills(cats.flatMap((c) => c.predefined_skills));
      })
      .catch(() => { setCategories([]); setAllSkills([]); })
      .finally(() => setLoadingSkills(false));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedIds = new Set(selected.filter((s) => !s.isCustom).map((s) => s.id));
  const selectedNames = new Set(selected.map((s) => s.name.toLowerCase()));

  const searchMatches = query.trim()
    ? allSkills.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) &&
          !selectedNames.has(s.name.toLowerCase())
      )
    : [];

  const canAddCustom =
    query.trim().length > 0 &&
    !selectedNames.has(query.trim().toLowerCase()) &&
    !allSkills.some((s) => s.name.toLowerCase() === query.trim().toLowerCase());

  const showDropdown =
    dropdownOpen && query.trim().length > 0 && (searchMatches.length > 0 || canAddCustom);

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addPredefined = (skill: PredefinedSkill) => {
    if (selectedNames.has(skill.name.toLowerCase())) return;
    setSelected((prev) => [...prev, { id: skill.id, name: skill.name, isCustom: false }]);
    setQuery("");
    setDropdownOpen(false);
    if (error) setError("");
  };

  const removePredefined = (id: string) =>
    setSelected((prev) => prev.filter((s) => s.id !== id));

  const addCustom = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || selectedNames.has(trimmed.toLowerCase())) return;
    setSelected((prev) => [...prev, { name: trimmed, isCustom: true }]);
    setQuery("");
    setDropdownOpen(false);
    if (error) setError("");
  };

  const removeSkill = (skill: SelectedSkill) =>
    setSelected((prev) => prev.filter((s) => s.name !== skill.name));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchMatches.length > 0) addPredefined(searchMatches[0]);
      else if (canAddCustom) addCustom(query);
    }
    if (e.key === "Escape") setDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) { setError("Add at least one skill to continue"); return; }
    setIsSubmitting(true);
    const entries: SkillEntry[] = selected.map((s) =>
      s.isCustom || !s.id ? { skill_name: s.name } : { predefined_skill_id: s.id }
    );
    await onComplete(entries);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Your skills</h2>
        <p className="text-sm text-gray-500 mt-1">
          Search or browse by category — type anything new to add it
        </p>
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((s) => (
            <span
              key={s.name}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                s.isCustom
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-cyan-50 border-cyan-200 text-cyan-700"
              )}
            >
              {s.name}
              <button
                type="button"
                onClick={() => removeSkill(s)}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search bar + dropdown */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          {loadingSkills ? (
            <Loader2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
          ) : (
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          )}
          <input
            type="text"
            placeholder={loadingSkills ? "Loading skills…" : "Search skills…"}
            value={query}
            disabled={isSubmitting || loadingSkills}
            onChange={(e) => { setQuery(e.target.value); setDropdownOpen(true); }}
            onFocus={() => { if (query.trim()) setDropdownOpen(true); }}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Search dropdown */}
        {showDropdown && (
          <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <ul className="max-h-52 overflow-y-auto overflow-x-hidden divide-y divide-gray-100">
              {searchMatches.map((skill) => (
                <li key={skill.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); addPredefined(skill); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
                  >
                    {skill.name}
                  </button>
                </li>
              ))}
              {canAddCustom && (
                <li>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); addCustom(query); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-2"
                  >
                    <Plus size={13} />
                    Add &ldquo;{query.trim()}&rdquo; as a new skill
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Category accordion — hidden while searching */}
      {!query.trim() && !loadingSkills && categories.length > 0 && (
        <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 max-h-60 overflow-y-auto overflow-x-hidden">
          {categories.map((cat) => {
            const isOpen = openCategories.has(cat.id);
            const selectedInCat = cat.predefined_skills.filter((s) =>
              selectedIds.has(s.id)
            ).length;

            return (
              <div key={cat.id}>
                {/* Category header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight
                      size={14}
                      className={cn(
                        "text-gray-400 transition-transform duration-200 shrink-0",
                        isOpen && "rotate-90"
                      )}
                    />
                    <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                    {selectedInCat > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-[10px] font-bold leading-none">
                        {selectedInCat}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0">
                    {cat.predefined_skills.length} skills
                  </span>
                </button>

                {/* Expanded skills */}
                {isOpen && (
                  <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1 bg-gray-50/60">
                    {cat.predefined_skills.map((skill) => {
                      const active = selectedIds.has(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() =>
                            active ? removePredefined(skill.id) : addPredefined(skill)
                          }
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                            active
                              ? "bg-cyan-50 border-cyan-400 text-cyan-700"
                              : "bg-white border-gray-200 text-gray-600 hover:border-cyan-300 hover:bg-cyan-50/50"
                          )}
                        >
                          {active && <span className="mr-0.5">✓</span>}
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button
        type="submit"
        variant="primary-gradient"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </span>
        ) : (
          "Complete setup"
        )}
      </Button>
    </form>
  );
}
