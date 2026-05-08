import { Pencil, Check, X } from "lucide-react";
import { useState } from "react";

interface CostBreakdownProps {
  accommodationAmount: number;
  totalNights:number,
  ratePerNight:number,
  taxInclusive:number,
  securityDepositAmount:number,
  commissionPercentage:number,
  commissionAmount:number,
  exclusiveTaxAmount:number,
  totalTaxAmount:number,
  extraServicesAmount: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  balancedAmount: number;
  currency?: string;
  onSave?: (data: { discount: number }) => void;
}

const CostBreakdown = ({
  accommodationAmount,
  totalNights,
  ratePerNight,
  taxInclusive,
  securityDepositAmount,
  commissionPercentage,
  commissionAmount,
  exclusiveTaxAmount,
  totalTaxAmount,
  extraServicesAmount,
  discount,
  totalAmount,
  amountPaid,
  balancedAmount,
  currency = "£",
  onSave,
}: CostBreakdownProps) => {
  const safe = (n: number) => (Number(n) || 0).toFixed(2);

  // const [isEditing, setIsEditing] = useState(false);
  // const [discountVal, setDiscountVal] = useState(safe(discount));
  // const [snapshot, setSnapshot] = useState(discountVal);

  // const handleEdit = () => { setSnapshot(discountVal); setIsEditing(true); };
  // const handleCancel = () => { setDiscountVal(snapshot); setIsEditing(false); };
  // const handleSave = () => { setIsEditing(false); onSave?.({ discount: parseFloat(discountVal) || 0 }); };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900">Cost Breakdown</h2>
        {/* {isEditing ? (
          <div className="flex gap-1.5">
            <button onClick={handleCancel} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors">
              <X className="w-3 h-3" />Cancel
            </button>
            <button onClick={handleSave} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors">
              <Check className="w-3 h-3" />Save
            </button>
          </div>
        ) : (
          <button onClick={handleEdit} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 transition-colors">
            <Pencil className="w-3 h-3" />Edit
          </button>
        )} */}
      </div>

      {/* Line items */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Accommodation ({currency}{ratePerNight} * {totalNights})</span>
          <span className="text-sm font-semibold text-slate-800">{currency}{safe(accommodationAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Extra Services</span>
          <span className="text-sm font-semibold text-slate-800">{currency}{safe(extraServicesAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Discount</span>
           <span className="text-sm font-semibold text-slate-800">{currency}{(parseFloat(discount) || 0).toFixed(2)}</span>
          {/* {isEditing ? (
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-xs text-slate-400">{currency}</span>
              <input
                type="number"
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                className="w-28 text-sm font-semibold text-right rounded-lg pl-6 pr-3 py-1 border border-rose-300 outline-none focus:ring-2 focus:ring-rose-50 bg-white text-slate-800"
              />
            </div>
          ) : (
            <span className="text-sm font-semibold text-slate-800">{currency}{(parseFloat(discountVal) || 0).toFixed(2)}</span>
          )} */}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Tax Inclusive</span>
          <span className="text-sm font-semibold text-slate-800">{currency}{safe(taxInclusive)}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 mb-4" />

      {/* Totals */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900">Total Amount</span>
          <span className="text-base font-bold text-slate-900">{currency}{safe(totalAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Amount Paid</span>
          <span className="text-sm text-slate-500">{currency}{safe(amountPaid)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Security Deposit Amount</span>
          <span className="text-sm text-slate-500">{currency}{safe(securityDepositAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Commission({commissionPercentage}%)</span>
          <span className="text-sm text-slate-500">{currency}{safe(commissionAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Tax Exclusive</span>
          <span className="text-sm text-slate-500">{currency}{safe(exclusiveTaxAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Total Tax Amount</span>
          <span className="text-sm text-slate-500">{currency}{safe(totalTaxAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-rose-600">Balance</span>
          <span className="text-sm font-semibold text-rose-600">{currency}{safe(balancedAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdown;
