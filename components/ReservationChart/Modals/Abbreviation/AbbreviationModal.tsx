"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function AbbreviationsModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const data = [
    { short: "PET", full: "Pet friendly apartment" },
    { short: "PET-CONF", full: "Pet approval required from landlord" },
    { short: "NO-PET", full: "Pets not allowed" },
    { short: "BALC", full: "Balcony available in apartment" },
    { short: "NO-BALC", full: "Balcony not available in apartment" },
    { short: "FLR", full: "Apartment Floor" },
  ];

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

            {/* Data Rows */}
            {data.map((item, index) => (
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
            className="rounded-md bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect } from "react";
// import { X } from "lucide-react";

// export default function AbbreviationsModal({ isOpen, onClose }) {
//   useEffect(() => {
//     const handleEsc = (e) => {
//       if (e.key === "Escape") onClose();
//     };
//     document.addEventListener("keydown", handleEsc);
//     return () => document.removeEventListener("keydown", handleEsc);
//   }, [onClose]);

//   if (!isOpen) return null;

//   const data = [
//     { short: "PET", full: "Pet friendly apartment" },
//     { short: "PET-CONF", full: "Pet approval required from landlord" },
//     { short: "NO-PET", full: "Pets not allowed" },
//     { short: "BALC", full: "Balcony available in apartment" },
//     { short: "NO-BALC", full: "Balcony not available in apartment" },
//     { short: "FLR", full: "Apartment Floor" },
//   ];

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
//       onClick={onClose}
//     >
//       <div
//         className="w-full max-w-xl rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between border-b px-6 py-5">
//           <h2 className="text-xl font-semibold tracking-tight text-gray-900">
//             Abbreviations
//           </h2>
//           <button
//             onClick={onClose}
//             className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="max-h-[400px] space-y-3 overflow-y-auto px-6 py-6">
//           {data.map((item, index) => (
//             <div
//               key={index}
//               className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-gray-200 hover:bg-white hover:shadow-sm"
//             >
//               <div className="min-w-[70px] rounded-lg bg-red-500 px-3 py-1 text-center text-sm font-semibold text-white">
//                 {item.short}
//               </div>

//               <p className="text-sm text-gray-600 leading-relaxed">
//                 {item.full}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* Footer */}
//         <div className="border-t px-6 py-4 flex justify-end">
//           <button
//             onClick={onClose}
//             className="rounded-xl bg-red-500 px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
