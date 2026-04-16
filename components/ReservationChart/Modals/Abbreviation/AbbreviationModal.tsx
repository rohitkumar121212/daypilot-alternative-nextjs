"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { ABBREVIATION_LIST } from "@/constants/constant";
interface AbbreviationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AbbreviationsModal({ isOpen, onClose }:AbbreviationsModalProps) {
  useEffect(() => {
    const handleEsc = (e:KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Abbreviations
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Table-like Layout */}
        <div className="px-6 py-6">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            
            {/* Header Row */}
            <div className="grid grid-cols-3 bg-gray-50 text-sm font-semibold text-gray-700">
              <div className="border-r px-4 py-3">Abbreviation</div>
              <div className="px-4 py-3 col-span-2">Full Form</div>
            </div>

            {/* ABBREVIATION_LIST Rows */}
            {ABBREVIATION_LIST.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-3 text-sm text-gray-700 border-t"
              >
                <div className="border-r px-4 py-3 font-medium text-gray-900">
                  {item.short}
                </div>
                <div className="px-4 py-3 col-span-2">
                  {item.full}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-6 py-4">
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}