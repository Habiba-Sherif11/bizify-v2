"use client";

import { useState } from "react";
import { Home, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  PartnerCard,
  type PartnerCardProps,
  type PartnerType,
} from "@/features/marketplace/components/PartnerCard";

// ─── Static data ─────────────────────────────────────────────────────────────

const PARTNERS: PartnerCardProps[] = [
  {
    id: "1", name: "Nile Pack Co.", type: "Supplier",
    specialty: "Sustainable packaging & materials",
    rating: 4.8, reviewCount: 124,
    description: "Leading sustainable packaging supplier serving 200+ startups across MENA. Minimum orders from 500 units. Fast 3-day shipping across Egypt and Gulf.",
    tags: ["Packaging", "Eco-Friendly", "B2B", "MENA"],
    avatarColor: "bg-cyan-600",
    onConnect: () => toast.info("Connection request sent!"),
  },
  {
    id: "2", name: "FabTech Egypt", type: "Manufacturer",
    specialty: "Electronics & PCB assembly",
    rating: 4.6, reviewCount: 87,
    description: "Full-service electronics manufacturer with ISO 9001 certification. Specialising in PCB assembly, IoT devices, and consumer electronics prototyping.",
    tags: ["Electronics", "IoT", "PCB", "ISO Certified"],
    avatarColor: "bg-indigo-600",
    onConnect: () => toast.info("Connection request sent!"),
  },
  {
    id: "3", name: "Sara Haddad", type: "Mentor",
    specialty: "Fintech & payments strategy",
    rating: 5.0, reviewCount: 43,
    description: "Former VP at Fawry and advisor to 12+ fintech startups. Helps founders navigate regulatory landscapes, build payment infrastructure, and close Series A rounds.",
    tags: ["Fintech", "Payments", "Series A", "Strategy"],
    avatarColor: "bg-amber-500",
    onConnect: () => toast.info("Connection request sent!"),
  },
  {
    id: "4", name: "Delta Fabrics", type: "Supplier",
    specialty: "Textiles & custom apparel",
    rating: 4.4, reviewCount: 211,
    description: "Premium fabric supplier with custom print-on-demand and private label services. GOTS-certified organic cotton available. Ships to 40+ countries.",
    tags: ["Textiles", "Fashion", "Custom Print", "GOTS"],
    avatarColor: "bg-cyan-700",
    onConnect: () => toast.info("Connection request sent!"),
  },
  {
    id: "5", name: "Cairo Mfg. Group", type: "Manufacturer",
    specialty: "Plastic injection & moulding",
    rating: 4.3, reviewCount: 65,
    description: "Specialised in rapid prototyping and mass production of plastic parts. Supports startup NRE (non-recurring engineering) with low minimums from 100 units.",
    tags: ["Plastics", "Prototyping", "Low MOQ", "Hardware"],
    avatarColor: "bg-indigo-500",
    onConnect: () => toast.info("Connection request sent!"),
  },
  {
    id: "6", name: "Omar Khalil", type: "Mentor",
    specialty: "Growth hacking & digital marketing",
    rating: 4.9, reviewCount: 78,
    description: "Growth advisor who has scaled 3 startups to $1M+ ARR. Expertise in SEO, paid acquisition, content loops, and community-led growth for B2C and B2B SaaS.",
    tags: ["Growth", "SEO", "SaaS", "B2C", "Marketing"],
    avatarColor: "bg-amber-600",
    onConnect: () => toast.info("Connection request sent!"),
  },
  {
    id: "7", name: "SpeedBox Logistics", type: "Supplier",
    specialty: "Last-mile delivery & fulfilment",
    rating: 4.5, reviewCount: 156,
    description: "3PL provider offering warehousing, pick-and-pack, and same-day delivery across 12 cities. Integrates with Shopify, WooCommerce, and Salla.",
    tags: ["Logistics", "3PL", "E-commerce", "Same-Day"],
    avatarColor: "bg-cyan-800",
    onConnect: () => toast.info("Connection request sent!"),
  },
  {
    id: "8", name: "Laila Mostafa", type: "Mentor",
    specialty: "Product design & UX strategy",
    rating: 4.7, reviewCount: 29,
    description: "Product designer with 10+ years at Careem and Instabug. Coaches founders on building user-centric products, running usability tests, and defining MVP scope.",
    tags: ["Product", "UX", "MVP", "Design Thinking"],
    avatarColor: "bg-amber-400",
    onConnect: () => toast.info("Connection request sent!"),
  },
];

type FilterTab = "All" | PartnerType;
const FILTER_TABS: FilterTab[] = ["All", "Supplier", "Manufacturer", "Mentor"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");

  const filtered = PARTNERS.filter((p) => {
    const matchType   = activeFilter === "All" || p.type === activeFilter;
    const matchSearch = search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.specialty.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

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

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <PartnerCard key={p.id} {...p} />
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
