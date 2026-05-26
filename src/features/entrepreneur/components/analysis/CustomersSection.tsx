"use client";

import { Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Persona {
  name: string;
  age?: string;
  category?: string;
  behaviors?: string[];
  description?: string;
}

// Backend shape: customer_segments array
interface CustomerSegment {
  id?: string;
  name: string;
  description?: string;
  pain_intensity?: string;
  size_estimate?: string;
  willingness_to_pay?: string;
  why_they_care?: string;
  behavior?: string;
  where_to_find?: string[];
}

interface JourneyStage {
  step: number;
  name: string;
  description: string;
}

interface KeyInsight {
  insight: string;
  explanation: string;
  implication: string;
}

interface CustomersData {
  // Actual backend fields
  customer_segments?: CustomerSegment[];
  primary_segment?: { id?: string; reason?: string };
  acquisition_channels?: string[];
  early_adopter_profile?: string;
  summary?: string;
  sources_list?: { url: string; title: string }[];
  // Legacy / alternate fields
  personas?: Persona[];
  painPoints?: string[];
  journeyStages?: JourneyStage[];
  keyInsights?: KeyInsight[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const PERSONA_TAG_COLORS = [
  "bg-amber-500",
  "bg-cyan-600",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-rose-500",
];

const JOURNEY_COLORS = [
  "bg-amber-500",
  "bg-amber-400",
  "bg-cyan-600",
  "bg-cyan-800",
  "bg-yellow-500",
];

const INSIGHT_BADGE_COLORS = [
  "bg-indigo-100 text-blue-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
];

const DEFAULT_JOURNEY_STAGES: JourneyStage[] = [
  { step: 1, name: "Awareness",     description: "First touchpoint with brand or product." },
  { step: 2, name: "Consideration", description: "Researching and evaluating options." },
  { step: 3, name: "Conversion",    description: "Making the purchase decision." },
  { step: 4, name: "Onboarding",    description: "Initial setup and first use." },
  { step: 5, name: "Advocacy",      description: "Sharing and recommending to others." },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseCustomersData(raw: string): CustomersData | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      // Accept both the actual backend shape (customer_segments) and the legacy shape (personas etc.)
      const hasData =
        parsed.customer_segments ||
        parsed.personas ||
        parsed.painPoints ||
        parsed.journeyStages ||
        parsed.keyInsights ||
        parsed.acquisition_channels ||
        parsed.summary;
      if (hasData) return parsed as CustomersData;
    }
  } catch {
    // not valid JSON — fall back to plain text
  }
  return null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
        <Users size={16} />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Target Customers</h2>
    </div>
  );
}

function PersonaCard({ persona, index }: { persona: Persona; index: number }) {
  const tagColor = PERSONA_TAG_COLORS[index % PERSONA_TAG_COLORS.length];
  const avatarBg = ["bg-amber-100", "bg-cyan-100", "bg-yellow-100", "bg-purple-100"][index % 4];
  const avatarText = ["text-amber-700", "text-cyan-700", "text-yellow-700", "text-purple-700"][index % 4];

  return (
    <div className="flex-1 min-w-50 p-6 bg-card rounded-lg shadow-sm border border-border flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold", avatarBg, avatarText)}>
          {getInitials(persona.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{persona.name}</p>
          {persona.age && <p className="text-xs text-muted-foreground">Age: {persona.age}</p>}
        </div>
      </div>

      {persona.category && (
        <span className={cn("self-start px-2 py-0.5 rounded-lg text-xs font-semibold text-white", tagColor)}>
          {persona.category}
        </span>
      )}

      {persona.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{persona.description}</p>
      )}

      {persona.behaviors && persona.behaviors.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Behaviors</p>
          <ul className="flex flex-col gap-1">
            {persona.behaviors.map((b, i) => (
              <li key={i} className="text-sm text-foreground">{b}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SegmentCard({ segment, index }: { segment: CustomerSegment; index: number }) {
  const tagColor = PERSONA_TAG_COLORS[index % PERSONA_TAG_COLORS.length];
  const avatarBg = ["bg-amber-100", "bg-cyan-100", "bg-yellow-100", "bg-purple-100"][index % 4];
  const avatarText = ["text-amber-700", "text-cyan-700", "text-yellow-700", "text-purple-700"][index % 4];

  return (
    <div className="flex-1 min-w-50 p-6 bg-card rounded-lg shadow-sm border border-border flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold", avatarBg, avatarText)}>
          {getInitials(segment.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{segment.name}</p>
          {segment.size_estimate && (
            <p className="text-xs text-muted-foreground truncate">{segment.size_estimate}</p>
          )}
        </div>
      </div>

      {segment.pain_intensity && (
        <span className={cn("self-start px-2 py-0.5 rounded-lg text-xs font-semibold text-white", tagColor)}>
          Pain: {segment.pain_intensity}
        </span>
      )}

      {segment.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{segment.description}</p>
      )}

      <div className="flex flex-col gap-2">
        {segment.why_they_care && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Why they care</p>
            <p className="text-sm text-foreground">{segment.why_they_care}</p>
          </div>
        )}
        {segment.willingness_to_pay && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Willingness to pay</p>
            <p className="text-sm text-foreground capitalize">{segment.willingness_to_pay}</p>
          </div>
        )}
        {segment.where_to_find && segment.where_to_find.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Where to find them</p>
            <div className="flex flex-wrap gap-1">
              {segment.where_to_find.map((w, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-xs text-gray-600 dark:text-gray-300">
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PainPointsCard({ painPoints }: { painPoints: string[] }) {
  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border border-border flex flex-col gap-4">
      <h3 className="text-base font-semibold text-foreground">Pain Points &amp; Problems</h3>
      <ul className="flex flex-col gap-1.5">
        {painPoints.map((p, i) => (
          <li key={i} className="text-sm text-foreground">{p}</li>
        ))}
      </ul>
    </div>
  );
}

function JourneyMap({ stages }: { stages: JourneyStage[] }) {
  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border border-border overflow-x-auto">
      <div className="relative min-w-140">
        {/* connecting line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200 dark:bg-neutral-600 z-0" />

        <div className="relative z-10 flex justify-between items-start">
          {stages.map((stage, i) => {
            const color = JOURNEY_COLORS[i % JOURNEY_COLORS.length];
            return (
              <div key={stage.step} className="flex flex-col items-center text-center flex-1 px-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mb-3",
                    "ring-4 ring-white dark:ring-neutral-800",
                    color
                  )}
                >
                  {stage.step}
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">{stage.name}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400 leading-4">{stage.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InsightsTable({ insights }: { insights: KeyInsight[] }) {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-amber-500 grid grid-cols-[160px_1fr_1fr]">
        {["Insight", "Explanation", "Implication"].map((h) => (
          <div key={h} className="px-5 py-3.5 text-xs font-semibold text-white uppercase tracking-wide">
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {insights.map((item, i) => (
        <div
          key={i}
          className={cn(
            "grid grid-cols-[160px_1fr_1fr] items-center border-t border-border",
            i % 2 === 1 && "bg-slate-50 dark:bg-neutral-750"
          )}
        >
          {/* Insight tag */}
          <div className="px-5 py-6 flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">{String(i + 1).padStart(2, "0")}</span>
            <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-medium", INSIGHT_BADGE_COLORS[i % INSIGHT_BADGE_COLORS.length])}>
              {item.insight}
            </span>
          </div>

          {/* Explanation */}
          <div className="px-5 py-6">
            <p className="text-sm text-slate-700 dark:text-gray-300 leading-6">{item.explanation}</p>
          </div>

          {/* Implication */}
          <div className="px-5 py-6 flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
            <p className="text-sm text-slate-800 dark:text-gray-200 leading-6">{item.implication}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomersSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-5 w-40 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </div>
      <div className="flex flex-col sm:flex-row gap-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 h-52 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        ))}
      </div>
      <div className="h-36 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
      <div className="h-28 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
      <div className="h-48 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export function CustomersSection({ data, isLoading, error }: SectionState) {
  if (isLoading) return <CustomersSkeleton />;

  if (error) {
    return (
      <div className="flex items-start gap-3 text-red-500 p-5 rounded-xl border border-border bg-card">
        <AlertCircle size={18} className="shrink-0 mt-0.5" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl border-2 border-dashed border-border bg-card">
        <p className="text-sm text-muted-foreground text-center">Run the pipeline to generate customer analysis.</p>
      </div>
    );
  }

  const structured = parseCustomersData(data);

  if (!structured) {
    return (
      <div className="flex flex-col gap-4">
        <SectionHeader />
        <div className="rounded-xl border border-border bg-card p-5">
          <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">{data}</pre>
        </div>
      </div>
    );
  }

  const {
    customer_segments = [],
    primary_segment,
    personas = [],
    painPoints = [],
    journeyStages,
    keyInsights = [],
    acquisition_channels = [],
    early_adopter_profile,
    summary,
  } = structured;

  const stages = journeyStages && journeyStages.length > 0 ? journeyStages : DEFAULT_JOURNEY_STAGES;

  // Use customer_segments (real backend data) if available, otherwise fall back to personas
  const showSegments = customer_segments.length > 0;
  const showPersonas = !showSegments && personas.length > 0;

  // Find the primary segment details
  const primarySegment = primary_segment?.id
    ? customer_segments.find((s) => s.id === primary_segment.id)
    : customer_segments[0];

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader />

      {/* Summary */}
      {summary && (
        <section className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-foreground leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Primary Segment Recommendation Banner */}
      {showSegments && primarySegment && (
        <section className="rounded-xl border-2 border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/10 px-5 py-4 flex gap-4">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
            #1
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
              Focus on: {primarySegment.name}
            </p>
            {primary_segment?.reason && (
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">{primary_segment.reason}</p>
            )}
            {!primary_segment?.reason && primarySegment.why_they_care && (
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                They care most because: {primarySegment.why_they_care}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Customer Segments (actual backend shape) */}
      {showSegments && (
        <section className="flex flex-col gap-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Customer Segments</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Detailed profiles of core customer archetypes.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 flex-wrap">
            {customer_segments.map((seg, i) => (
              <SegmentCard key={seg.id ?? i} segment={seg} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Legacy persona cards */}
      {showPersonas && (
        <section className="flex flex-col gap-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Target Audience Personas</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Detailed profiles of our core customer archetypes.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 flex-wrap">
            {personas.map((p, i) => (
              <PersonaCard key={i} persona={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Early adopter profile */}
      {early_adopter_profile && (
        <section className="flex flex-col gap-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Early Adopter Profile</h3>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-foreground leading-relaxed">{early_adopter_profile}</p>
          </div>
        </section>
      )}

      {/* Acquisition channels */}
      {acquisition_channels.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Acquisition Channels</h3>
          <div className="flex flex-wrap gap-2">
            {acquisition_channels.map((ch, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                {ch}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Pain Points (legacy) */}
      {painPoints.length > 0 && (
        <section>
          <PainPointsCard painPoints={painPoints} />
        </section>
      )}

      {/* Customer Journey Map */}
      <section className="flex flex-col gap-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Customer Journey Map</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Visualizing the path from discovery to long-term advocacy.</p>
        </div>
        <JourneyMap stages={stages} />
      </section>

      {/* Key Insights (legacy) */}
      {keyInsights.length > 0 && (
        <section className="flex flex-col gap-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Key Insights from Personas</h3>
            <p className="text-sm text-muted-foreground mt-0.5">A summary of patterns identified across target users.</p>
          </div>
          <InsightsTable insights={keyInsights} />
        </section>
      )}
    </div>
  );
}
