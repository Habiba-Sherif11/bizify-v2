"use client";

import { useState, useCallback } from "react";
import { Share2, X, ExternalLink, Copy, Check } from "lucide-react";

export type ShareItem = {
  idea_id: string;
  idea_title: string;
  token: string;
  share_url: string;
};

export function ShareModal({ items, onClose }: { items: ShareItem[]; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback((url: string, key: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold">
            <Share2 size={16} className="text-cyan-500" />
            Share {items.length === 1 ? "idea" : `${items.length} ideas`}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-80 overflow-y-auto">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Anyone with a link can view the idea — no login required.
          </p>
          {items.map((item) => (
            <div
              key={item.token}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 space-y-1.5"
            >
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">
                {item.idea_title}
              </p>
              <div className="flex items-center gap-2">
                <span className="flex-1 text-xs text-neutral-500 dark:text-neutral-400 truncate font-mono">
                  {item.share_url}
                </span>
                <a
                  href={item.share_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-cyan-500 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  type="button"
                  onClick={() => copy(item.share_url, item.token)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors cursor-pointer"
                >
                  {copied === item.token ? <Check size={12} /> : <Copy size={12} />}
                  {copied === item.token ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
