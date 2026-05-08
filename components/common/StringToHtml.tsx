import { useMemo } from "react";

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

interface BookingNotesProps {
  content?: string
  heading: string
  booking_id?: string | number | undefined
}

export default function BookingNotes({ content, heading, booking_id }: BookingNotesProps) {
  const fullText = useMemo(() => {
    return htmlToFormattedText(content || "");
  }, [content]);

  const lines = fullText.split("\n");
  const previewText = lines.slice(0, 3).join("\n");

  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {heading}
      </h3>

      <div className="relative">
        <textarea
          value={previewText}
          readOnly
          rows={3}
          className="w-full border border-gray-300 rounded-md p-2 resize-none bg-gray-50"
        />
        {/* {lines.length > 3 && (
          <button
            className="absolute bottom-2 right-2 text-blue-600 text-xs bg-gray-50 px-1 hover:underline"
            onClick={() => {
              console.log("redirect to full page");
            }}
          >
            Read More
          </button>
          
        )} */}
        {
          lines.length > 3 && (
             <a
              href={`https://aperfectstay.ai/aperfect-pms/booking/${booking_id}/view-details`}
              target="_blank"
              rel="noopener noreferrer"
              // className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition cursor-pointer inline-block"
              className='absolute bottom-2 right-2 text-blue-600 text-xs bg-gray-50 px-1 hover:underline'
            >
              Read More
            </a> 
          )
        }
      </div>
    </div>
  );
}