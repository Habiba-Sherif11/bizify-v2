"use client";

import { X, ExternalLink, MapPin, Phone, Award, Briefcase, Tag, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MentorDetail {
  id: string;
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

interface MentorDetailModalProps {
  mentor: MentorDetail | null;
  onClose: () => void;
}

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

export function MentorDetailModal({ mentor, onClose }: MentorDetailModalProps) {
  if (!mentor) return null;

  const initials = mentor.name
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
            <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-xl font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{mentor.name}</h2>
              {mentor.headline && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{mentor.headline}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {mentor.category && (
                  <span className="px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                    {mentor.category}
                  </span>
                )}
                {mentor.country && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <MapPin size={12} />
                    {mentor.country}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* About */}
          {(mentor.about_summary || mentor.description) && (
            <Section icon={<FileText size={15} className="text-amber-500" />} title="About">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {mentor.about_summary || mentor.description}
              </p>
            </Section>
          )}

          {/* Skills */}
          {mentor.skills.length > 0 && (
            <Section icon={<Tag size={15} className="text-amber-500" />} title="Skills & Expertise">
              <div className="flex flex-wrap gap-2">
                {mentor.skills.map((skill) => (
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
          {mentor.experience.length > 0 && (
            <Section icon={<Briefcase size={15} className="text-amber-500" />} title="Experience">
              <div className="flex flex-col gap-2">
                {mentor.experience.map((exp, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      {exp.role && (
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{exp.role}</p>
                      )}
                      {exp.company && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{exp.company}</p>
                      )}
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
          <Section icon={<Award size={15} className="text-amber-500" />} title="Certificates & Documents">
            {mentor.certificates.length > 0 ? (
              <div className="flex flex-col gap-2">
                {mentor.certificates.map((url, i) => {
                  const filename = url.split("/").pop() ?? `Certificate ${i + 1}`;
                  const isPdf = url.toLowerCase().endsWith(".pdf");
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <Award size={14} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                          {isPdf ? filename.replace(/_/g, " ").replace(/\.pdf$/i, "") : `Document ${i + 1}`}
                        </p>
                        <p className="text-xs text-gray-400">{isPdf ? "PDF" : "File"}</p>
                      </div>
                      <ExternalLink size={13} className="text-gray-400 group-hover:text-amber-500 transition-colors shrink-0" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                No certificates uploaded yet.
              </p>
            )}
          </Section>

          {/* Contact actions */}
          <div className={cn("flex flex-col gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700")}>
            {mentor.phone && mentor.phone.trim() && (
              <a
                href={`tel:${mentor.phone}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-gray-600 dark:text-gray-300 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <Phone size={14} className="text-amber-500 shrink-0" />
                {mentor.phone}
              </a>
            )}
            {mentor.linkedinUrl && (
              <a
                href={mentor.linkedinUrl}
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
