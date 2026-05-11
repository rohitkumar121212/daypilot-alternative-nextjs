"use client";

import React, { useEffect, useRef, useState } from "react";

type Lang = {
  code: string;
  label: string;
};

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [languages, setLanguages] = useState<Lang[]>([]);
  const [selected, setSelected] = useState<Lang | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadLanguages = () => {
      const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (!select || select.options.length === 0) return false;

      const langsFromGoogle: Lang[] = Array.from(select.options)
        .filter((opt) => opt.value)
        .map((opt) => ({ code: opt.value, label: opt.text }));

      const hasEnglish = langsFromGoogle.some((l) => l.code === "en");
      const langs: Lang[] = hasEnglish
        ? langsFromGoogle
        : [{ code: "en", label: "English" }, ...langsFromGoogle];

      setLanguages(langs);
      setSelected(langs.find((l) => l.code === "en") || langs[0]);
      return true;
    };

    if (loadLanguages()) return;

    const interval = setInterval(() => {
      if (loadLanguages()) clearInterval(interval);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const changeLanguage = (lang: string) => {
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (!select) return;

    const triggerChange = (value: string) => {
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    };

    if (select.value === "en" && lang !== "en") {
      triggerChange("en");
      setTimeout(() => triggerChange(lang), 400);
      return;
    }

    triggerChange(lang);
  };

  const handleSelect = (lang: Lang) => {
    setSelected(lang);
    changeLanguage(lang.code);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!selected) return null;

  return (
    <div ref={dropdownRef} style={containerStyle} translate="no">
      <button style={triggerStyle} onClick={() => setOpen(!open)}>
        <span style={labelStyle}>{selected.label}</span>
        <span style={chevronStyle}>▾</span>
      </button>

      {open && (
        <div style={menuStyle}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              style={{
                ...menuItemStyle,
                backgroundColor: selected.code === lang.code ? "#e5e7eb" : "#ffffff",
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  position: "relative",
  width: "160px",
  backgroundColor: "#f3f4f6",
  borderRadius: "10px",
  padding: "4px",
};

const triggerStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 10px",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 500,
};

const menuStyle: React.CSSProperties = {
  position: "absolute",
  top: "110%",
  left: 0,
  right: 0,
  maxHeight: "280px",
  overflowY: "auto",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  zIndex: 1000,
};

const menuItemStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "none",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 500,
};

const labelStyle: React.CSSProperties = {
  color: "#374151",
};

const chevronStyle: React.CSSProperties = {
  fontSize: "10px",
  color: "#6b7280",
};
