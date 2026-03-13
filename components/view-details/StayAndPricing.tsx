import { CalendarDays } from "lucide-react";

interface StayAndPricingProps {
  checkIn: string;
  checkOut: string;
  totalNights: number;
  ratePerNight: number;
  totalAmount: number;
  currency?: string;
}

const StayAndPricing = ({
  checkIn,
  checkOut,
  totalNights,
  ratePerNight,
  totalAmount,
  currency = "£",
}: StayAndPricingProps) => {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-rose-50 rounded-lg">
          <CalendarDays className="w-4 h-4 text-rose-500" />
        </div>
        <h2 className="text-base font-semibold text-slate-800">Stay & Pricing</h2>
      </div>

      {/* Dates Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Check-in</p>
          <p className="text-sm font-semibold text-slate-800">{checkIn}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Check-out</p>
          <p className="text-sm font-semibold text-slate-800">{checkOut}</p>
        </div>
      </div>

      <div className="border-t border-slate-50 my-4" />

      {/* Nights + Rate Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Total Nights</p>
          <p className="text-sm font-semibold text-slate-800">{totalNights}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Rate / Night</p>
          <p className="text-sm font-semibold text-slate-800">
            {currency}{ratePerNight.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-50 my-4" />

      {/* Rate Calculation */}
      <div>
        <p className="text-xs text-slate-400 mb-2">Rate Calculation</p>
        <div className="bg-slate-50 rounded-lg px-4 py-3">
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">{totalNights} nights</span>
            {" × "}
            <span className="font-medium text-slate-800">
              {currency}{ratePerNight.toFixed(2)}
            </span>
            {" = "}
            <span className="font-bold text-slate-900">
              {currency}{totalAmount.toFixed(2)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StayAndPricing;