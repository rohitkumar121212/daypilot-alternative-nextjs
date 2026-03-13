import { ArrowLeft, CheckCircle, Printer, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BookingHeaderProps {
  bookingId: string;
  propertyName: string;
  propertyAddress: string;
  status: "checked-in" | "checked-out" | "pending" | "cancelled";
  onBack?: () => void;
  onPrint?: () => void;
  onEdit?: () => void;
}

const statusConfig = {
  "checked-in": {
    label: "Checked In",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  "checked-out": {
    label: "Checked Out",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: null,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: null,
  },
};

const BookingHeader = ({
  bookingId,
  propertyName,
  propertyAddress,
  status,
  onBack,
  onPrint,
  onEdit,
}: BookingHeaderProps) => {
  const statusInfo = statusConfig[status];

  return (
    <div className="flex items-start justify-between mb-8">
      {/* Left: Back + Title */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to bookings
        </button>

        <div className="flex items-center gap-3 mb-1.5">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Booking {bookingId}
          </h1>
          <Badge
            variant="outline"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${statusInfo.className}`}
          >
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </div>

        <p className="text-sm font-semibold text-slate-700">{propertyName}</p>
        <p className="text-sm text-slate-400">{propertyAddress}</p>
      </div>

      {/* Right: ID + Actions */}
      <div className="flex flex-col items-end gap-3">
        <span className="text-xs text-slate-400 font-mono">ID: {bookingId}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            // onClick={onPrint}
            className="flex items-center gap-1.5 text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Summary
          </Button>
          <Button
            size="sm"
            // onClick={onEdit}
            className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white border-0"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingHeader;