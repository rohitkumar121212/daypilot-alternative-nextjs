import { CalendarCheck, CalendarX, Moon, BadgePoundSterling } from "lucide-react";

interface BookingStatCardsProps {
  checkIn: string;
  checkInTime: string;
  checkOut: string;
  checkOutTime: string;
  totalNights: number;
  ratePerNight: number;
  currency?: string;
}

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
}

const StatCard = ({ label, value, subValue, icon }: StatCardProps) => (
  <div className="bg-white border border-slate-100 rounded-xl px-5 py-4 flex-1 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-slate-300">{icon}</span>
    </div>
    <p className="text-lg font-bold text-slate-900">{value}</p>
    {subValue && <p className="text-xs text-slate-400 mt-0.5">{subValue}</p>}
  </div>
);

const BookingStatCards = ({
  checkIn,
  checkInTime,
  checkOut,
  checkOutTime,
  totalNights,
  ratePerNight,
  currency = "£",
}: BookingStatCardsProps) => {
  return (
    <div className="flex gap-4 mb-8">
      <StatCard
        label="Check-in"
        value={checkIn}
        subValue={checkInTime}
        icon={<CalendarCheck className="w-4 h-4" />}
      />
      <StatCard
        label="Check-out"
        value={checkOut}
        subValue={checkOutTime}
        icon={<CalendarX className="w-4 h-4" />}
      />
      <StatCard
        label="Total Nights"
        value={String(totalNights)}
        icon={<Moon className="w-4 h-4" />}
      />
      <StatCard
        label="Rate / Night"
        value={`${currency}${ratePerNight.toFixed(2)}`}
        icon={<BadgePoundSterling className="w-4 h-4" />}
      />
    </div>
  );
};

export default BookingStatCards;