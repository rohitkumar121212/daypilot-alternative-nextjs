import { BadgePoundSterling, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentDetailsProps {
  currency?: string;
  rentPerNight: number;
  totalNights: number;
  roomTariff: number;
  addOns: number;
  otherCharges: number;
  taxesExclusive: number;
  taxesInclusive: number;
  totalTaxes: number;
  commissionPercent: number;
  commissionPayable: number;
  securityDeposit: number;
  revenueAgainstCancellation: number;
  total: number;
  amountPaid: number;
  discount: number;
  balance: number;
  onCurrencyConverter?: () => void;
}

interface RowProps {
  label: string;
  value: React.ReactNode;
  shaded?: boolean;
  bold?: boolean;
  labelColor?: string;
  valueColor?: string;
}

const Row = ({ label, value, shaded, bold, labelColor, valueColor }: RowProps) => (
  <tr className={shaded ? "bg-slate-50" : "bg-white"}>
    <td
      className={`px-4 py-3 text-sm border border-slate-200 w-40 align-middle ${
        bold ? "font-bold" : "font-medium"
      } ${labelColor ?? "text-slate-700"}`}
    >
      {label}
    </td>
    <td
      className={`px-4 py-3 text-sm border border-slate-200 ${
        bold ? "font-bold" : ""
      } ${valueColor ?? "text-slate-800"}`}
    >
      {value}
    </td>
  </tr>
);

const InputCell = ({ value }: { value: string | number }) => (
  <div className="inline-block bg-white border border-slate-200 rounded px-3 py-1.5 text-sm text-slate-700 min-w-[120px]">
    {value}
  </div>
);

const PaymentDetails = ({
  currency = "£",
  rentPerNight,
  totalNights,
  roomTariff,
  addOns,
  otherCharges,
  taxesExclusive,
  taxesInclusive,
  totalTaxes,
  commissionPercent,
  commissionPayable,
  securityDeposit,
  revenueAgainstCancellation,
  total,
  amountPaid,
  discount,
  balance,
  onCurrencyConverter,
}: PaymentDetailsProps) => {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-full border-2 border-rose-500 flex items-center justify-center">
          <BadgePoundSterling className="w-4 h-4 text-rose-500" />
        </div>
        <h2 className="text-base font-semibold text-slate-800">
          Payment Details ({currency === "£" ? "GBP" : currency})
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border border-slate-200 w-40">
                Item
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border border-slate-200">
                Sub Total
              </th>
            </tr>
          </thead>
          <tbody>
            <Row
              label="Rent Per Night"
              value={<InputCell value={rentPerNight.toFixed(2)} />}
            />
            <Row
              shaded
              label="Rent Per Night * Duration"
              value={
                <span className="text-sm text-slate-700">
                  <span className="font-semibold">{currency} {rentPerNight.toFixed(2)}</span>
                  {" x "}
                  <span className="font-semibold">{totalNights} Nights</span>
                </span>
              }
            />
            <Row
              label="Room Tariff"
              value={
                <span className="font-semibold text-slate-900">
                  {currency} {roomTariff.toFixed(2)}
                </span>
              }
            />
            <Row shaded label="Add-ons" value={<span className="text-slate-600">{addOns.toFixed(2)}</span>} />
            <Row
              label="Other Charges"
              value={<InputCell value={otherCharges} />}
            />
            <Row
              shaded
              label="Taxes (Exclusive)"
              value={
                <span className="font-semibold text-slate-900">
                  {currency} {taxesExclusive}
                </span>
              }
            />
            <Row
              label="Taxes (Inclusive)"
              value={
                <span className="font-semibold text-slate-900">
                  {currency} {taxesInclusive}
                </span>
              }
            />
            <Row shaded label="Total Tax(es)" value={<span className="text-slate-600">{totalTaxes}</span>} />
            <Row
              label="Commission Percent"
              value={<InputCell value={commissionPercent} />}
            />
            <Row
              shaded
              label="Commission Payable"
              value={<InputCell value={commissionPayable.toFixed(1)} />}
            />
            <Row
              label="Security Deposit"
              value={<InputCell value={securityDeposit} />}
            />
            <Row
              shaded
              label="Revenue Against Cancellation"
              value={<InputCell value={revenueAgainstCancellation.toFixed(1)} />}
            />

            {/* Spacer */}
            <tr>
              <td colSpan={2} className="py-1 border border-slate-200 bg-white" />
            </tr>

            {/* Total */}
            <tr className="bg-slate-800">
              <td className="px-4 py-3.5 text-sm font-bold border bg-rose-50">
                Total
              </td>
              <td className="px-4 py-3.5 border bg-rose-50">
                <InputCell value={total.toFixed(2)} />
              </td>
            </tr>

            {/* Amount Paid */}
            <Row
              label="Amount Paid"
              value={<InputCell value={amountPaid} />}
              labelColor="text-rose-600"
              bold
            />

            {/* Discount */}
            <Row shaded label="Discount" value={<InputCell value={discount} />} />

            {/* Balance */}
            <tr className="bg-white">
              <td className="px-4 py-4 border border-slate-200">
                <span className="text-sm font-bold text-slate-900">Balance</span>
              </td>
              <td className="px-4 py-4 border border-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-base font-extrabold text-rose-600">
                    {currency} {balance.toFixed(2)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCurrencyConverter}
                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 border-rose-200 hover:bg-rose-50 uppercase tracking-wide"
                  >
                    Currency Converter
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentDetails;