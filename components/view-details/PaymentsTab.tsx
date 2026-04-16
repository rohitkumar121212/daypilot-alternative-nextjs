import PaymentDetails from "@/components/view-details/PaymentDetails";
import PaymentHistory, { PaymentHistoryEntry } from "@/components/view-details/PaymentHistory";

interface ApiPaymentHistoryEntry {
  accepted_per: string;
  amount: number;
  created_at: string;
  key: number;
  mode: string;
  notes: string;
  receipt_img: string;
  receipt_pdf: string;
  ref_num: string;
  reservation_history_id: number;
  time: string;
}

interface PaymentsTabProps {
  paymentDetails: {
    additional_services_amount: number;
    cancellation_charges: number;
    commission_amount: number;
    commission_percentage: number;
    discount_amount: number;
    exclusive_tax_amount: number;
    inclusive_tax_amount: number;
    ratePerNight: number;
    revenue_against_cancellation: number;
    security_deposit_amount: number;
    taxAmount: number;
    totalAmount: number;
    totalNights: number;
    total_paid_amount: number;
  };
  paymentHistory: ApiPaymentHistoryEntry[];
}

const mapPaymentHistory = (entries: ApiPaymentHistoryEntry[]): PaymentHistoryEntry[] =>
  entries.map((e) => ({
    id: String(e.reservation_history_id),
    paymentMode: e.mode,
    createdAt: `${e.created_at} ${e.time}`,
    amount: e.amount,
    referenceId: e.ref_num,
    acceptedBy: e.accepted_per,
    notes: e.notes,
    invoice: e.receipt_pdf || e.receipt_img || undefined,
  }));

const PaymentsTab = ({ paymentDetails, paymentHistory }: PaymentsTabProps) => {
  const roomTariff = paymentDetails.ratePerNight * paymentDetails.totalNights;
  const balance = paymentDetails.totalAmount - paymentDetails.total_paid_amount;

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-2 space-y-4">
        <PaymentDetails
          currency="£"
          rentPerNight={paymentDetails.ratePerNight}
          totalNights={paymentDetails.totalNights}
          roomTariff={roomTariff}
          addOns={paymentDetails.additional_services_amount}
          otherCharges={paymentDetails.cancellation_charges}
          taxesExclusive={paymentDetails.exclusive_tax_amount}
          taxesInclusive={paymentDetails.inclusive_tax_amount}
          totalTaxes={paymentDetails.taxAmount}
          commissionPercent={paymentDetails.commission_percentage}
          commissionPayable={paymentDetails.commission_amount}
          securityDeposit={paymentDetails.security_deposit_amount}
          revenueAgainstCancellation={paymentDetails.revenue_against_cancellation}
          total={paymentDetails.totalAmount}
          amountPaid={paymentDetails.total_paid_amount}
          discount={paymentDetails.discount_amount}
          balance={balance}
          onCurrencyConverter={() => console.log("Open currency converter")}
        />
      </div>
      <div className="col-span-2">
        <PaymentHistory entries={mapPaymentHistory(paymentHistory)} />
      </div>
    </div>
  );
};

export default PaymentsTab;