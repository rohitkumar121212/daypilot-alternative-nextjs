import { BadgePoundSterling } from "lucide-react";

interface OverviewPaymentCardProps {
  currency?: string;
  rentPerNight: number;
  totalNights: number;
  roomTariff: number;
  additionalServices: number;
  commissionPercent: number;
  commissionAmount: number;
  taxAmount: number;
  securityDeposit: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
}

const Row = ({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "total" | "paid" | "balance";
}) => {
  const valueClass =
    highlight === "total"
      ? "font-extrabold text-rose-600 text-base"
      : highlight === "paid"
      ? "font-bold text-emerald-600"
      : highlight === "balance"
      ? "font-bold text-amber-600"
      : "font-semibold text-slate-800";

  return (
    <div className="flex items-start justify-between gap-2 py-2.5 border-b border-slate-50 last:border-0">
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <p className={`text-sm shrink-0 ${valueClass}`}>{value}</p>
    </div>
  );
};

const OverviewPaymentCard = ({
  currency = "£",
  rentPerNight,
  totalNights,
  roomTariff,
  additionalServices,
  commissionPercent,
  commissionAmount,
  taxAmount,
  securityDeposit,
  totalAmount,
  amountPaid,
  balance,
}: OverviewPaymentCardProps) => {
  const safe = (n: number) => (Number(n) || 0).toFixed(2);

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full border-2 border-rose-500 flex items-center justify-center shrink-0">
          <BadgePoundSterling className="w-3.5 h-3.5 text-rose-500" />
        </div>
        <h2 className="text-sm font-bold text-slate-800">
          Payment Details ({currency === "£" ? "GBP" : currency})
        </h2>
      </div>

      <div>
        <Row
          label="Rent / Night"
          value={`${currency}${safe(rentPerNight)}`}
        />
        <Row
          label="Room Tariff"
          sub={`${currency}${safe(rentPerNight)} × ${totalNights} nights`}
          value={`${currency}${safe(roomTariff)}`}
        />
        {Number(additionalServices) > 0 && (
          <Row label="Additional Services" value={`${currency}${safe(additionalServices)}`} />
        )}
        {Number(taxAmount) > 0 && (
          <Row label="Tax" value={`${currency}${safe(taxAmount)}`} />
        )}
        {Number(commissionAmount) > 0 && (
          <Row
            label="Commission"
            sub={`${safe(commissionPercent)}%`}
            value={`${currency}${safe(commissionAmount)}`}
          />
        )}
        {Number(securityDeposit) > 0 && (
          <Row label="Security Deposit" value={`${currency}${safe(securityDeposit)}`} />
        )}
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between bg-rose-50 rounded-xl px-4 py-3">
          <span className="text-sm font-bold text-slate-800">Total</span>
          <span className="text-base font-extrabold text-rose-600">
            {currency}{safe(totalAmount)}
          </span>
        </div>
        <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-2.5">
          <span className="text-sm font-semibold text-slate-700">Amount Paid</span>
          <span className="text-sm font-bold text-emerald-600">
            {currency}{safe(amountPaid)}
          </span>
        </div>
        <div className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-2.5">
          <span className="text-sm font-semibold text-slate-700">Balance Due</span>
          <span className="text-sm font-bold text-amber-600">
            {currency}{safe(balance)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OverviewPaymentCard;
