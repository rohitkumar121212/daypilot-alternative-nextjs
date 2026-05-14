"use client";

import FloatingDropdown from "@/components/common/FloatingDropdown";
import FloatingInput from "@/components/common/FloatingInput";
import FloatingLabelTextarea from "@/components/common/FloatingLabelTextarea";
import { fetchUtils } from "@/utils/fetchUtils";
import { proxyFetch } from "@/utils/proxyFetch";
import { useEffect, useState } from "react";

interface AddPaymentModalProps {
  bookingId: string | number;
  bookingKey?: string;
  bookedBy?: string;
  onClose: () => void;
}

const AddPaymentModal = ({ bookingId, bookingKey, bookedBy, onClose }: AddPaymentModalProps) => {
  const [reservationConstants, setReservationConstants] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "",
    referenceNo: "",
    receipt: null as File | null,
    notes: "",
    acceptedBy: bookedBy || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    proxyFetch("/aps-api/v1/constants/reservation")
      .then((res: any) => setReservationConstants(res?.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.amount.trim()) newErrors.amount = "Amount is required";
    else if (parseFloat(formData.amount) < 0) newErrors.amount = "Amount cannot be negative";
    if (!formData.paymentMethod) newErrors.paymentMethod = "Payment method is required";
    if (!formData.acceptedBy?.trim()) newErrors.acceptedBy = "Accepted by is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const formPayload = new FormData();
    formPayload.append("enq_id_payment", bookingKey || "");
    formPayload.append("amount", formData.amount);
    formPayload.append("mode", formData.paymentMethod);
    formPayload.append("refernce", formData.referenceNo);
    formPayload.append("accepted_by", formData.acceptedBy);
    formPayload.append("notes", formData.notes);
    formPayload.append("payment_method", "Add Payment");
    formPayload.append("response_version", "v1");
    if (formData.receipt) formPayload.append("receipt_img", formData.receipt);

    try {
      const url =
        process.env.NODE_ENV === "development"
          ? "/api/proxy/add-payment"
          : "https://aperfectstay.ai/api/aperfect-pms/add-new-booking-payment";
      const { data } = await fetchUtils.post(url, formPayload);
      if (data.success) {
        alert("Payment added successfully!");
        onClose();
      } else {
        alert(data.error || "Failed to add payment");
      }
    } catch {
      alert("Failed to add payment");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, receipt: e.target.files[0] });
    }
  };

  const set = (key: keyof typeof formData) => (value: string) => {
    setFormData((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[92%] md:w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Add Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FloatingInput
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => set("amount")(e.target.value)}
              error={errors.amount}
              required
            />
            <FloatingDropdown
              label="Payment Method"
              options={reservationConstants?.paymentMethods}
              value={formData.paymentMethod}
              onChange={set("paymentMethod")}
              error={errors.paymentMethod}
              required
            />
            <FloatingInput
              label="Reference No."
              value={formData.referenceNo}
              onChange={(e) => set("referenceNo")(e.target.value)}
            />
            <FloatingInput
              label="Accepted By"
              value={formData.acceptedBy}
              onChange={() => {}}
              error={errors.acceptedBy}
              readOnly
              required
            />
            <FloatingInput label="Receipt" type="file" onChange={handleFileChange} />
          </div>
          <FloatingLabelTextarea
            label="Notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => set("notes")(e.target.value)}
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={handleSubmit} className="btn btn-primary-with-bg">
            Add Payment
          </button>
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentModal;
