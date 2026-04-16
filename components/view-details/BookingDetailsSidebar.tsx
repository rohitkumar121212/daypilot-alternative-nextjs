import { AlertCircle } from "lucide-react";

interface BookingDetailsSidebarProps {
  bookingDetails: {
    booking_status: string;
    booking_created_at: string;
    channel_ota_name: string;
    sales_channel: string;
    sales_person: string;
    enquiry_manager: string;
    lead_source: string;
    duration: number;
  };
  extensionPending?: {
    reason: string;
    additionalCost: number;
    currency?: string;
  };
}

interface DetailRowProps {
  label: string;
  value: string | number;
}

const DetailRow = ({ label, value }: DetailRowProps) => (
  <>
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
    </div>
    <div className="border-t border-slate-50" />
  </>
);

const BookingDetailsSidebar = ({
  bookingDetails,
  extensionPending,
}: BookingDetailsSidebarProps) => {
  const currency = extensionPending?.currency ?? "£";

  return (
    <div className="space-y-4">
      {/* Booking Details Card */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-4">Booking Details</h2>

        <div className="space-y-4">
          <DetailRow label="Status" value={bookingDetails.booking_status} />
          <DetailRow label="Created" value={bookingDetails.booking_created_at} />
          <DetailRow label="Channel" value={bookingDetails.channel_ota_name} />
          <DetailRow label="Sales Channel" value={bookingDetails.sales_channel} />
          <DetailRow label="Sales Person" value={bookingDetails.sales_person} />
          <DetailRow label="Enquiry Manager" value={bookingDetails.enquiry_manager} />
          <DetailRow label="Lead Source" value={bookingDetails.lead_source} />
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Duration</p>
            <p className="text-sm font-semibold text-slate-800">{bookingDetails.duration} nights</p>
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