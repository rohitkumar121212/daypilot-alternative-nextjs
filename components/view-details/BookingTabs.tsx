"use client";

import { useState } from "react";

export type TabKey = "overview" | "payments" | "guest" | "support" | "additional-info";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "payments", label: "Payments" },
  { key: "guest", label: "Guest" },
  { key: "support", label: "Support" },
  { key: "additional-info", label: "Additional Information" },
];

interface BookingTabsProps {
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
}

const BookingTabs = ({ activeTab = "overview", onTabChange }: BookingTabsProps) => {
  const [selected, setSelected] = useState<TabKey>(activeTab);

  const handleClick = (key: TabKey) => {
    setSelected(key);
    onTabChange?.(key);
  };

  return (
    <div className="border-b border-slate-100 mb-6">
      <nav className="flex gap-6">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleClick(key)}
            className={`relative pb-3 text-sm font-medium transition-colors ${selected === key
                ? "text-rose-500"
                : "text-slate-400 hover:text-slate-700"
              }`}
          >
            {label}
            {selected === key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default BookingTabs;