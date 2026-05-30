"use client";

import { X, ExternalLink, MapPin, Phone, Award, Briefcase, Tag, FileText, Package, Factory } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PartnerType } from "./PartnerCard";

export interface PartnerDetail {
  id: string;
  partnerType: PartnerType;
  name: string;
  headline?: string;
  about_summary?: string;
  description?: string;
  category?: string;
  country?: string;
  phone?: string;
  linkedinUrl?: string;
  skills: string[];
  experience: Array<{ role?: string; company?: string; years?: string; since?: string }>;
  certificates: string[];
}

// Re-export as MentorDetail alias for backward compat with existing imports
export type MentorDetail = PartnerDetail;

interface Props {
  partner: PartnerDetail | null;
  onClose: () => void;
}

const TYPE_CONFIG: Record<PartnerType, {
  accent: string;
  badge: string;
  avatar: string;
  border: string;
  icon: React.ReactNode;
  skillsTitle: string;
  certsTitle: string;
}> = {
  Mentor: {
    accent: "text-amber-500",
    badge: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    avatar: "bg-amber-500",
    border: "hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10",
    icon: <Tag size={15} className="text-amber-500" />,
    skillsTitle: "Skills & Expertise",
    certsTitle: "Certificates & Documents",
  },
  Supplier: {
    accent: "text-cyan-500",
    badge: "border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400",
    avatar: "bg-cyan-600",
    border: "hover:border-cyan-400 dark:hover:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/10",
    icon: <Package size={15} className="text-cyan-500" />,
    skillsTitle: "Products & Services",
    certsTitle: "Certifications & Documents",
  },
  Manufacturer: {
    accent: "text-indigo-500",
    badge: "border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    avatar: "bg-indigo-600",
    border: "hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10",
    icon: <Factory size={15} className="text-indigo-500" />,
    skillsTitle: "Capabilities & Products",
    certsTitle: "Certifications & Documents",
  },
};

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

export function PartnerDetailModal({ partner, onClose }: Props) {
  if (!partner) return null;

  const cfg = TYPE_CONFIG[partner.partnerType] ?? TYPE_CONFIG.Mentor;
  const initials = partner.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-10 cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Hero */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-start gap-4">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0", cfg.avatar)}>
              {initials}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-start gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{partner.name}</h2>
                <span className={cn("shrink-0 mt-0.5 px-2.5 py-0.5 rounded-full border text-xs font-medium", cfg.badge)}>
                  {partner.partnerType}
                </span>
              </div>
              {partner.headline && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{partner.headline}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {partner.category && (
                  <span className={cn("px-2.5 py-0.5 rounded-full border text-xs font-medium", cfg.badge)}>
                    {partner.category}
                  </span>
                )}
                {partner.country && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <MapPin size={12} />
                    {partner.country}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* About */}
          {(partner.about_summary || partner.description) && (
            <Section icon={<FileText size={15} className={cfg.accent} />} title="About">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {partner.about_summary || partner.description}
              </p>
            </Section>
          )}

          {/* Skills / Services / Capabilities */}
          {partner.skills.length > 0 && (
            <Section icon={cfg.icon} title={cfg.skillsTitle}>
              <div className="flex flex-wrap gap-2">
                {partner.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs text-gray-600 dark:text-gray-300 border border-neutral-200 dark:border-neutral-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Experience */}
          {partner.experience.length > 0 && (
            <Section icon={<Briefcase size={15} className={cfg.accent} />} title="Experience">
              <div className="flex flex-col gap-2">
                {partner.experience.map((exp, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                  >
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", cfg.avatar)} />
                    <div className="min-w-0">
                      {exp.role && <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{exp.role}</p>}
                      {exp.company && <p className="text-xs text-gray-500 dark:text-gray-400">{exp.company}</p>}
                      {(exp.years || exp.since) && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {exp.years ?? `Since ${exp.since}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Certificates */}
          <Section icon={<Award size={15} className={cfg.accent} />} title={cfg.certsTitle}>
            {partner.certificates.length > 0 ? (
              <div className="flex flex-col gap-2">
                {partner.certificates.map((url, i) => {
                  const filename = url.split("/").pop() ?? `Document ${i + 1}`;
                  const isPdf = url.toLowerCase().endsWith(".pdf");
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors group",
                        cfg.border
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        partner.partnerType === "Mentor" ? "bg-amber-100 dark:bg-amber-900/30" :
                        partner.partnerType === "Supplier" ? "bg-cyan-100 dark:bg-cyan-900/30" :
                        "bg-indigo-100 dark:bg-indigo-900/30"
                      )}>
                        <Award size={14} className={cfg.accent} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate transition-colors">
                          {isPdf ? filename.replace(/_/g, " ").replace(/\.pdf$/i, "") : `Document ${i + 1}`}
                        </p>
                        <p className="text-xs text-gray-400">{isPdf ? "PDF" : "File"}</p>
                      </div>
                      <ExternalLink size={13} className="text-gray-400 shrink-0" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">No documents uploaded yet.</p>
            )}
          </Section>

          {/* Contact */}
          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
            {partner.phone && partner.phone.trim() && (
              <a
                href={`tel:${partner.phone}`}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-gray-600 dark:text-gray-300 transition-colors",
                  partner.partnerType === "Mentor" ? "hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400" :
                  partner.partnerType === "Supplier" ? "hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400" :
                  "hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                )}
              >
                <Phone size={14} className={cn("shrink-0", cfg.accent)} />
                {partner.phone}
              </a>
            )}
            {partner.linkedinUrl && (
              <a
                href={partner.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
              >
                <ExternalLink size={14} className="shrink-0" />
                View LinkedIn Profile
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Backward-compat re-export so existing import of MentorDetailModal still works
export { PartnerDetailModal as MentorDetailModal };
