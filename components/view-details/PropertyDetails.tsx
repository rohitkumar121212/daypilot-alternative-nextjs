import { Home } from "lucide-react";

interface PropertyDetailsProps {
  propertyName: string;
  address: string;
  unitType: string;
}

const PropertyDetails = ({
  propertyName,
  address,
  unitType,
}: PropertyDetailsProps) => {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Home className="w-5 h-5 text-rose-500" />
        <h2 className="text-base font-bold text-slate-800">Property Details</h2>
      </div>

      <div className="space-y-5">
        {/* Property Name */}
        <div>
          <p className="text-xs text-slate-400 mb-1">Property Name</p>
          <p className="text-sm font-bold text-slate-900">{propertyName}</p>
        </div>

        {/* Address */}
        <div>
          <p className="text-xs text-slate-400 mb-1">Address</p>
          <p className="text-sm text-slate-700 leading-relaxed">{address}</p>
        </div>

        {/* Unit Type */}
        <div>
          <p className="text-xs text-slate-400 mb-1">Unit Type</p>
          <p className="text-sm text-slate-700">{unitType}</p>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;