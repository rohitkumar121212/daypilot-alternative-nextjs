// import { useMemo } from "react";

// function stripHtml(html) {
//   if (!html) return "";

//   // Decode HTML entities
//   const txt = document.createElement("textarea");
//   txt.innerHTML = html;
//   const decoded = txt.value;

//   // Remove tags
//   return decoded.replace(/<[^>]*>/g, "").trim();
// }

// export default function BookingNotes({ booking }) {
//   const fullText = useMemo(() => {
//     return stripHtml(booking?.booking_details?.booking_notes);
//   }, [booking]);

//   const previewText = fullText.split("\n").slice(0, 3).join("\n");

//   return (
//     <div className="pt-4 border-t border-gray-300">
//       <h3 className="text-lg font-semibold text-gray-800 mb-2">
//         Other Details
//       </h3>

//       <textarea
//         value={previewText}
//         readOnly
//         rows={3}
//         className="w-full border border-gray-300 rounded-md p-2 resize-none bg-gray-50"
//       />

//       {fullText.split("\n").length > 3 && (
//         <button
//           className="text-blue-600 text-sm mt-2 hover:underline"
//           onClick={() => {
//             // navigate later
//             console.log("redirect to full page");
//           }}
//         >
//           Read More
//         </button>
//       )}
//     </div>
//   );
// }

import { useMemo } from "react";

// function htmlToFormattedText(html) {
//   if (!html) return "";

//   const div = document.createElement("div");
//   div.innerHTML = html;

//   // Add line breaks after block elements (like <p>)
//   div.querySelectorAll("p, br").forEach((el) => {
//     el.insertAdjacentText("afterend", "\n");
//   });

//   // Get clean text with preserved spacing
//   return div.textContent.replace(/\n\s*\n/g, "\n").trim();
// }
function htmlToFormattedText(html) {
  if (!html) return "";

  const div = document.createElement("div");

  // First decode
  div.innerHTML = html;

  // Second decode (handles &lt;p&gt; cases)
  div.innerHTML = div.textContent;

  // Convert block elements to line breaks
  div.querySelectorAll("p, br").forEach((el) => {
    el.insertAdjacentText("afterend", "\n");
  });

  return div.textContent.replace(/\n\s*\n/g, "\n").trim();
}

export default function BookingNotes({ booking }) {
  const fullText = useMemo(() => {
    return htmlToFormattedText(
      booking?.booking_details?.booking_notes || ""
    );
  }, [booking]);

  const lines = fullText.split("\n");
  const previewText = lines.slice(0, 3).join("\n");

  return (
    <div className="">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Notes
      </h3>

      <textarea
        value={previewText}
        readOnly
        rows={3}
        className="w-full border border-gray-300 rounded-md p-2 resize-none bg-gray-50"
      />

      {lines.length > 3 && (
        <button
          className="text-blue-600 text-sm mt-2 hover:underline"
          onClick={() => {
            console.log("redirect to full page");
          }}
        >
          Read More
        </button>
      )}
    </div>
  );
}