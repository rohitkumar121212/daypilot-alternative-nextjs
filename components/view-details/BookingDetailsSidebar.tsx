import { AlertCircle } from "lucide-react";

interface BookingDetailsSidebarProps {
  phase: string;
  createdDate: string;
  channel: string;
  extensionPending?: {
    reason: string;
    additionalCost: number;
    currency?: string;
  };
}

const BookingDetailsSidebar = ({
  phase,
  createdDate,
  channel,
  extensionPending,
}: BookingDetailsSidebarProps) => {
  const currency = extensionPending?.currency ?? "£";

  return (
    <div className="space-y-4">
      {/* Booking Details Card */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-4">Booking Details</h2>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Phase</p>
            <p className="text-sm font-semibold text-slate-800">{phase}</p>
          </div>

          <div className="border-t border-slate-50" />

          <div>
            <p className="text-xs text-slate-400 mb-0.5">Created</p>
            <p className="text-sm font-semibold text-slate-800">{createdDate}</p>
          </div>

          <div className="border-t border-slate-50" />

          <div>
            <p className="text-xs text-slate-400 mb-0.5">Channel</p>
            <p className="text-sm font-semibold text-slate-800">{channel}</p>
          </div>
        </div>
      </div>

      {/* Extension Pending Alert */}
      {extensionPending && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-sm font-bold text-amber-700">Extension Pending</span>
          </div>
          <p className="text-xs text-amber-600 mb-2 leading-relaxed">
            {extensionPending.reason}
          </p>
          <div className="bg-amber-100 rounded-lg px-3 py-2">
            <p className="text-xs font-semibold text-amber-700">
              Additional cost:{" "}
              <span className="font-extrabold">
                {currency}{extensionPending.additionalCost.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailsSidebar;