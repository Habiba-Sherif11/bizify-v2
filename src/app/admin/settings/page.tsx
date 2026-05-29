"use client";

import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 h-14 flex items-center px-6 gap-4">
        <Settings size={18} className="text-amber-500" />
        <div>
          <h1 className="text-base font-semibold text-neutral-900">System Settings</h1>
          <p className="text-[11px] text-neutral-400">Platform configuration and administration options</p>
        </div>
      </header>
      <main className="p-6 max-w-[800px] mx-auto">
        <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-400">
          <Settings size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-neutral-600">System settings coming soon</p>
          <p className="text-xs mt-1">Platform configuration options will appear here.</p>
        </div>
      </main>
    </div>
  );
}
