"use client";

import { useState, useEffect, useCallback } from "react";
import { Home, ChevronRight, Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  PartnerCard,
  type PartnerCardProps,
  type PartnerType,
} from "@/features/marketplace/components/PartnerCard";
import { PartnerDetailModal, type PartnerDetail } from "@/features/marketplace/components/PartnerDetailModal";
import { api } from "@/features/auth/lib/api";

// ─── API types ────────────────────────────────────────────────────────────────

interface PartnerCategory {
  id: string;
  name: string;
  partner_type: "MENTOR" | "SUPPLIER" | "MANUFACTURER";
}

interface MarketplacePartner {
  id: string;
  partner_type: "MENTOR" | "SUPPLIER" | "MANUFACTURER";
  company_name: string;
  phone_number: string | null;
  description: string;
  services_json: unknown;
  experience_json: unknown;
  display_name: string;
  category_id: string | null;
  category_name: string | null;
  linkedin_url: string | null;
  headline: string | null;
  about_summary: string | null;
  skills_json: unknown;
  country: string | null;
  documents_json: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_MAP: Record<MarketplacePartner["partner_type"], PartnerType> = {
  SUPPLIER: "Supplier",
  MANUFACTURER: "Manufacturer",
  MENTOR: "Mentor",
};

const AVATAR_COLORS: Record<PartnerType, string> = {
  Supplier: "bg-cyan-600",
  Manufacturer: "bg-indigo-600",
  Mentor: "bg-amber-500",
};

function parseTags(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "object") return Object.values(raw as Record<string, unknown>).map(String).filter(Boolean);
  if (typeof raw !== "string") return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    if (parsed && typeof parsed === "object") return Object.values(parsed as Record<string, unknown>).map(String).filter(Boolean);
    return [trimmed];
  } catch {
    return [trimmed];
  }
}

function parseExperience(raw: unknown): MentorDetail["experience"] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : (typeof raw === "object" ? Object.values(raw as Record<string, unknown>) : []);
  return arr.filter(Boolean).map((item) => {
    if (typeof item === "object" && item !== null) return item as MentorDetail["experience"][number];
    return { role: String(item) };
  });
}

function parseCertificates(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "object") return Object.values(raw as Record<string, unknown>).map(String).filter(Boolean);
  return [];
}

function toCardProps(p: MarketplacePartner): PartnerCardProps {
  const type = TYPE_MAP[p.partner_type] ?? "Supplier";
  return {
    id: p.id,
    name: p.display_name || p.company_name,
    type,
    description: p.description,
    tags: parseTags(p.services_json || p.skills_json),
    avatarColor: AVATAR_COLORS[type],
    phone: p.phone_number ?? undefined,
    category: p.category_name ?? undefined,
    linkedinUrl: p.linkedin_url ?? undefined,
    headline: p.headline ?? undefined,
    country: p.country ?? undefined,
  };
}

function toPartnerDetail(p: MarketplacePartner): PartnerDetail {
  return {
    id: p.id,
    partnerType: TYPE_MAP[p.partner_type] ?? "Supplier",
    name: p.display_name || p.company_name,
    headline: p.headline ?? undefined,
    about_summary: p.about_summary ?? undefined,
    description: p.description,
    category: p.category_name ?? undefined,
    country: p.country ?? undefined,
    phone: p.phone_number ?? undefined,
    linkedinUrl: p.linkedin_url ?? undefined,
    skills: parseTags(p.skills_json || p.services_json),
    experience: parseExperience(p.experience_json),
    certificates: parseCertificates(p.documents_json),
  };
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterTab = "All" | PartnerType;
const FILTER_TABS: FilterTab[] = ["All", "Supplier", "Manufacturer", "Mentor"];

const BACKEND_TYPE: Record<PartnerType, string> = {
  Supplier: "SUPPLIER",
  Manufacturer: "MANUFACTURER",
  Mentor: "MENTOR",
};


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<PartnerCategory[]>([]);
  const [search, setSearch] = useState("");
  const [partners, setPartners] = useState<MarketplacePartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<PartnerDetail | null>(null);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (activeFilter !== "All") params.type = BACKEND_TYPE[activeFilter as PartnerType];

    api.get<PartnerCategory[]>("/marketplace/categories", { params })
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]));

    setActiveCategoryId(null);
  }, [activeFilter]);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeFilter !== "All") params.type = BACKEND_TYPE[activeFilter as PartnerType];
      if (activeCategoryId) params.category_id = activeCategoryId;
      if (search.trim()) params.q = search.trim();

      const { data } = await api.get<MarketplacePartner[]>("/marketplace/partners", { params });
      setPartners(data);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: unknown }; message?: string; code?: string };
      console.error("[Marketplace] fetch error", { status: e?.response?.status, data: e?.response?.data, message: e?.message, code: e?.code });
      toast.error("Failed to load marketplace partners.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, activeCategoryId, search]);

  useEffect(() => {
    const timer = setTimeout(fetchPartners, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchPartners, search]);

  const visibleCategories = activeFilter === "All"
    ? categories
    : categories.filter((c) => c.partner_type === BACKEND_TYPE[activeFilter as PartnerType]);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 pt-6 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/entrepreneur" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer">
            <Home size={14} />
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200 font-medium">Marketplace</span>
        </nav>

        {/* Header */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white">
              Marketplace
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Connect with verified suppliers, manufacturers and mentors
            </p>
          </div>

          {/* Type filter tabs */}
          <div className="flex items-center gap-1 bg-background dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-1 self-start sm:self-auto">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeFilter === tab
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {tab === "All" ? "All" : `${tab}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Category dropdown */}
        {visibleCategories.length > 0 && (
          <div className="mt-4 relative w-56">
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              aria-label="Filter by category"
              value={activeCategoryId ?? ""}
              onChange={(e) => setActiveCategoryId(e.target.value || null)}
              className="w-full appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-background dark:bg-neutral-800 text-gray-700 dark:text-gray-200 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors cursor-pointer"
            >
              <option value="">All Categories</option>
              {visibleCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search */}
        <div className="mt-4 relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search partners, specialties, tags…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-background dark:bg-neutral-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : partners.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {partners.map((p) => (
              <PartnerCard
                key={p.id}
                {...toCardProps(p)}
                onClick={() => {
                  setSelectedPartner(toPartnerDetail(p));
                  api.post(`/marketplace/partners/${p.id}/views`).catch(() => {});
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-24 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
              <Search size={20} className="text-neutral-400 dark:text-neutral-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No partners found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Try a different search or filter</p>
          </div>
        )}
      </main>

      <PartnerDetailModal
        partner={selectedPartner}
        onClose={() => setSelectedPartner(null)}
      />
    </div>
  );
}
