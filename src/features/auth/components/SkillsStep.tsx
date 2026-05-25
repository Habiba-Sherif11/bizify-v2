"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, Loader2, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "../lib/api";

export type SkillEntry = { skill_name: string };

interface NormalizedCategory {
  name: string;
  subcategories: string[];
}

interface Props {
  onComplete: (skills: SkillEntry[]) => Promise<void>;
  title?: string;
  description?: string;
  submitLabel?: string;
  existingSkillNames?: Set<string>;
}

interface SelectedSkill {
  name: string;
}

function normalizeCategories(raw: unknown): NormalizedCategory[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return { name: item, subcategories: [] };
        if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>;
          const name = String(obj.name ?? obj.category ?? obj.title ?? "");
          const subs = Array.isArray(obj.subcategories)
            ? (obj.subcategories as string[])
            : [];
          return { name, subcategories: subs };
        }
        return { name: "", subcategories: [] };
      })
      .filter((c) => c.name);
  }
  if (typeof raw === "object" && raw !== null) {
    return Object.entries(raw as Record<string, unknown>).map(([key, value]) => ({
      name: key,
      subcategories: Array.isArray(value) ? (value as string[]) : [],
    }));
  }
  return [];
}

export function SkillsStep({
  onComplete,
  title = "Your skills",
  description = "Search for skills or type anything to add a custom one",
  submitLabel = "Complete setup",
  existingSkillNames,
}: Props) {
  const [categories, setCategories] = useState<NormalizedCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedSkill[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api
      .get("/profile/skill-categories")
      .then((res) => setCategories(normalizeCategories(res.data)))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  const searchSkills = useCallback((q: string, category?: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      setLoadingSearch(false);
      return;
    }
    setLoadingSearch(true);
    const params = new URLSearchParams({ q });
    if (category) params.set("category", category);
    api
      .get(`/profile/skills/search?${params.toString()}`)
      .then((res) => {
        const results = res.data;
        setSearchResults(Array.isArray(results) ? (results as string[]) : []);
      })
      .catch(() => setSearchResults([]))
      .finally(() => setLoadingSearch(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(
      () => searchSkills(query, selectedCategory ?? undefined),
      300
    );
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedCategory, searchSkills]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedNames = new Set(selected.map((s) => s.name.toLowerCase()));
  const allTakenNames = existingSkillNames
    ? new Set([...selectedNames, ...existingSkillNames])
    : selectedNames;

  const filteredResults = searchResults.filter(
    (name) => !allTakenNames.has(name.toLowerCase())
  );
  const canAddCustom =
    query.trim().length > 0 &&
    !allTakenNames.has(query.trim().toLowerCase()) &&
    !searchResults.some((s) => s.toLowerCase() === query.trim().toLowerCase());

  const showDropdown =
    dropdownOpen &&
    query.trim().length > 0 &&
    (filteredResults.length > 0 || canAddCustom || loadingSearch);

  const addSkill = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || allTakenNames.has(trimmed.toLowerCase())) return;
    setSelected((prev) => [...prev, { name: trimmed }]);
    setQuery("");
    setDropdownOpen(false);
    setSearchResults([]);
    if (error) setError("");
  };

  const removeSkill = (name: string) =>
    setSelected((prev) => prev.filter((s) => s.name !== name));

  const handleCategoryClick = (cat: NormalizedCategory) => {
    setSelectedCategory((current) => (current === cat.name ? null : cat.name));
  };

  const handleSubcategoryClick = (subcat: string) => {
    addSkill(subcat);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults.length > 0) addSkill(filteredResults[0]);
      else if (canAddCustom) addSkill(query);
    }
    if (e.key === "Escape") setDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) {
      setError("Add at least one skill to continue");
      return;
    }
    setIsSubmitting(true);
    const entries: SkillEntry[] = selected.map((s) => ({ skill_name: s.name }));
    await onComplete(entries);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((s) => (
            <span
              key={s.name}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-900/30 dark:border-cyan-700 dark:text-cyan-300"
            >
              {s.name}
              <button
                type="button"
                onClick={() => removeSkill(s.name)}
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
          {loadingSearch ? (
            <Loader2
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
            />
          ) : (
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          )}
          <input
            type="text"
            placeholder="Search or add skills…"
            value={query}
            disabled={isSubmitting}
            onChange={(e) => {
              setQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => {
              if (query.trim()) setDropdownOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Search dropdown */}
        {showDropdown && (
          <div className="absolute z-20 top-full mt-1 w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-xl shadow-lg overflow-hidden">
            <ul className="max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-700">
              {loadingSearch && (
                <li className="px-4 py-2.5 text-sm text-gray-400 flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin" />
                  Searching…
                </li>
              )}
              {!loadingSearch &&
                filteredResults.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addSkill(name);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors"
                    >
                      {name}
                    </button>
                  </li>
                ))}
              {!loadingSearch && canAddCustom && (
                <li>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addSkill(query);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center gap-2"
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

      {/* Category quick-filters */}
      {!loadingCategories && categories.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
            Browse by category
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all",
                  selectedCategory === cat.name
                    ? "bg-cyan-50 dark:bg-cyan-900/30 border-cyan-400 dark:border-cyan-600 text-cyan-700 dark:text-cyan-400"
                    : "bg-white dark:bg-neutral-700 border-gray-200 dark:border-neutral-600 text-gray-600 dark:text-gray-300 hover:border-cyan-300 dark:hover:border-cyan-600 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20"
                )}
              >
                {cat.name}
                {cat.subcategories.length > 0 && (
                  <ChevronRight
                    size={11}
                    className={cn(
                      "transition-transform",
                      selectedCategory === cat.name && "rotate-90"
                    )}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Subcategories (when backend provides them) */}
          {selectedCategory && (() => {
            const cat = categories.find((c) => c.name === selectedCategory);
            if (!cat || cat.subcategories.length === 0) return null;
            return (
              <div className="pl-2 border-l-2 border-cyan-200 dark:border-cyan-700 mt-2 space-y-1.5">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {cat.name} — click to add
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.subcategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSubcategoryClick(sub)}
                      disabled={allTakenNames.has(sub.toLowerCase())}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs border transition-all",
                        allTakenNames.has(sub.toLowerCase())
                          ? "opacity-40 cursor-not-allowed bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-400"
                          : "bg-white dark:bg-neutral-700 border-gray-200 dark:border-neutral-600 text-gray-600 dark:text-gray-300 hover:border-cyan-300 dark:hover:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-400"
                      )}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

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
          submitLabel
        )}
      </Button>
    </form>
  );
}
