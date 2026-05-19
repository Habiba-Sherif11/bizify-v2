"use client";

import { useState, useEffect, useCallback } from "react";
import { Home, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  PartnerCard,
  type PartnerCardProps,
  type PartnerType,
} from "@/features/marketplace/components/PartnerCard";
import { api } from "@/features/auth/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";

// ─── API types ────────────────────────────────────────────────────────────────

interface MarketplacePartner {
  id: string;
  partner_type: "MENTOR" | "SUPPLIER" | "MANUFACTURER";
  company_name: string;
  description: string;
  services_json: unknown;
  experience_json: unknown;
  display_name: string;
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

function toCardProps(p: MarketplacePartner): PartnerCardProps {
  const type = TYPE_MAP[p.partner_type] ?? "Supplier";
  return {
    id: p.id,
    name: p.display_name || p.company_name,
    type,
    description: p.description,
    tags: parseTags(p.services_json),
    avatarColor: AVATAR_COLORS[type],
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
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [partners, setPartners] = useState<PartnerCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeFilter !== "All") params.type = BACKEND_TYPE[activeFilter];
      if (search.trim()) params.q = search.trim();

      const { data } = await api.get<MarketplacePartner[]>("/marketplace/partners", { params });
      setPartners(data.map(toCardProps));
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: unknown }; message?: string; code?: string };
      console.error("[Marketplace] fetch error", { status: e?.response?.status, data: e?.response?.data, message: e?.message, code: e?.code });
      toast.error("Failed to load marketplace partners.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, search]);

  useEffect(() => {
    const timer = setTimeout(fetchPartners, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchPartners, search]);

  async function handleConnect(partnerId: string) {
    if (!user?.business_id) {
      toast.error("No business profile found. Please complete your profile first.");
      return;
    }
    setConnecting(partnerId);
    try {
      await api.post(`/marketplace/partners/${partnerId}/requests`, {
        business_id: user.business_id,
      });
      toast.success("Collaboration request sent!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string; error?: string } } })
          ?.response?.data?.detail ||
        (err as { response?: { data?: { error?: string } } })
          ?.response?.data?.error ||
        "Failed to send request.";
      toast.error(msg);
    } finally {
      setConnecting(null);
    }
  }

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
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-white">
              Marketplace
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Connect with verified suppliers, manufacturers and mentors
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-1 self-start sm:self-auto">
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

        {/* Search */}
        <div className="mt-6 relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search partners, specialties, tags…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-cyan-400 dark:focus:border-cyan-500 transition-colors"
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
                {...p}
                connecting={connecting === p.id}
                onConnect={() => handleConnect(p.id)}
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
    </div>
  );
}
