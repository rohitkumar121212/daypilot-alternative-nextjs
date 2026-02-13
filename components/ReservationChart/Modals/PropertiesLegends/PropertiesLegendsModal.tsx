"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import Image from 'next/image';


export default function PropertiesLegendsModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const legends = [
    [
      { color: "bg-green-500", label: "Guest Checked In" },
      { color: "bg-green-500", label: "Guest Checked Out" },
    ],
    [
      { color: "bg-green-400", label: "Upcoming Booking" },
      { color: "bg-red-500", label: "Night Audited Property" },
    ],
    [
      { color: "bg-orange-400", label: "DNR (Do Not Reserve)" },
      { color: "bg-purple-400", label: "Temp Hold" },
    ],
    [
      { color: "bg-rose-900", label: "Overbooking" },
      { color: "bg-green-500", label: "Un-audited & Old Bookings" },
    ],
    [
      { color: "bg-cyan-400", label: "Split Booking" },
      { color: "bg-yellow-500", label: "Maintenance Tasks (Does not close the Calendar)" },
    ],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-8 py-5">
          <Image src="https://images.thesqua.re/APS/rgb.png" alt="Info" width={30} height={30} />
          
          <h2 className="text-xl font-semibold text-gray-900 text-center">
            Properties Legends
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grid Table Layout */}
        <div className="px-8 py-6">
          {/* Header Row */}
          <div className="grid grid-cols-4 text-sm font-semibold text-gray-600 border-b pb-3 mb-4 text-center">
            <div>Color Code</div>
            <div>Operation</div>
            <div>Color Code</div>
            <div>Operation</div>
          </div>

          {/* Rows */}
          <div className="space-y-4">
            {legends.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-4 items-center gap-4 rounded-xl bg-gray-50 p-4 transition hover:bg-white hover:shadow-sm"
              >
                {/* First Pair */}
                <div className="flex justify-center">
                  <div className="h-6 w-10 rounded-md bg-white flex items-center justify-center shadow-sm">
                    <div className={`h-6 w-10 rounded-sm ${row[0].color}`} />
                  </div>
                </div>

                <div className="text-sm text-gray-700 text-center">
                  {row[0].label}
                </div>

                {/* Second Pair */}
                <div className="flex justify-center">
                  <div className="h-6 w-10 rounded-md bg-white flex items-center justify-center shadow-sm">
                    <div className={`h-6 w-10 rounded-sm ${row[1].color}`} />
                  </div>
                </div>

                <div className="text-sm text-gray-700">
                  {row[1].label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t px-8 py-5">
          <button className="rounded-xl bg-red-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-red-700">
            Change Color Preferences
          </button>

          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
