import { Users } from "lucide-react";

interface GuestInformationProps {
  fullName: string;
  email: string;
  phone: string;
  adults: number;
  children: number;
  address: string;
}

const GuestInformation = ({
  fullName,
  email,
  phone,
  adults,
  children,
  address,
}: GuestInformationProps) => {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-rose-500" />
        <h2 className="text-base font-bold text-slate-800">Guest Information</h2>
      </div>

      <div className="space-y-5">
        {/* Full Name */}
        <div>
          <p className="text-xs text-slate-400 mb-1">Full Name</p>
          <p className="text-sm font-bold text-slate-900">{fullName}</p>
        </div>

        {/* Email */}
        <div>
          <p className="text-xs text-slate-400 mb-1">Email</p>
          <a
            href={`mailto:${email}`}
            className="text-sm text-slate-700 hover:text-rose-500 transition-colors"
          >
            {email}
          </a>
        </div>

        {/* Phone */}
        <div>
          <p className="text-xs text-slate-400 mb-1">Phone</p>
          <p className="text-sm text-slate-700">{phone}</p>
        </div>

        <div className="border-t border-slate-100" />

        {/* Occupancy */}
        <div>
          <p className="text-xs text-slate-400 mb-2">Occupancy</p>
          <div className="flex gap-6">
            <div>
              <p className="text-lg font-bold text-slate-900">{adults}</p>
              <p className="text-xs text-slate-400">Adults</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{children}</p>
              <p className="text-xs text-slate-400">Children</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Address */}
        <div>
          <p className="text-xs text-slate-400 mb-1">Address</p>
          <p className="text-sm text-slate-700 leading-relaxed">{address}</p>
        </div>
      </div>
    </div>
  );
};

export default GuestInformation;