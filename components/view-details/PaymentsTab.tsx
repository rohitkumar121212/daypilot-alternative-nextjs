import PaymentDetails from "@/components/view-details/PaymentDetails";
import PaymentHistory, { PaymentHistoryEntry } from "@/components/view-details/PaymentHistory";

// ─── Mock Payment Data ────────────────────────────────────────────────────────
const PAYMENT_DATA = {
  currency: "£",
  rentPerNight: 1000,
  totalNights: 2,
  roomTariff: 2000,
  addOns: 0,
  otherCharges: 0,
  taxesExclusive: 0,
  taxesInclusive: 0,
  totalTaxes: 0,
  commissionPercent: 10,
  commissionPayable: 200.0,
  securityDeposit: 0,
  revenueAgainstCancellation: 0.0,
  total: 1800,
  amountPaid: 0,
  discount: 0,
  balance: 1800,
};

const PAYMENT_HISTORY: PaymentHistoryEntry[] = [];
// ─────────────────────────────────────────────────────────────────────────────

const PaymentsTab = () => {
  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-2 space-y-4">
        <PaymentDetails
          {...PAYMENT_DATA}
          onCurrencyConverter={() => console.log("Open currency converter")}
        />
      </div>
      <div className="col-span-2">
        <PaymentHistory entries={PAYMENT_HISTORY} />
      </div>
    </div>
  );
};

export default PaymentsTab;