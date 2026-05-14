"use client";

import { useState, useEffect } from "react";
import FloatingInput from "@/components/common/FloatingInput";
import FloatingLabelTextarea from "@/components/common/FloatingLabelTextarea";

const SERVICE_OPTIONS = [
  "Airport Drop Off", "Airport Pick-Up", "Baby Cot", "Chromecast", "Cleaning Fee",
  "Damaged Linen/Towels", "Deep Cleaning Fee", "Desk & Chair", "Early Check-in",
  "Extra Bed", "Extra Duvet", "Extra Linen", "Extra Towel", "Grocery", "High Chair",
  "Key Collection", "Late Check-Out", "Late Check-In", "Laundry", "London Tour",
  "Lost Keys Penalty", "Meet and Greet", "Parking", "Pet Fee", "Portable AC",
  "Rice Cooker", "Safe Box", "Smoking Penalty", "Spa & Beauty", "Welcome Pack",
  "Damage/Loss Retention", "Others",
];

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | number;
  currency?: string;
  onSuccess?: () => void;
}

const today = new Date().toISOString().split("T")[0];

const CreateServiceModal = ({
  isOpen,
  onClose,
  currency = "£",
  onSuccess,
}: CreateServiceModalProps) => {
  const [form, setForm] = useState({
    name: "",
    date_of_service: today,
    service_cost: "",
    reason: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm({ name: "", date_of_service: today, service_cost: "", reason: "" });
    setErrors({});
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const orig = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = orig; };
    }
  }, [isOpen]);

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Service name is required";
    if (!form.date_of_service) e.date_of_service = "Date of service is required";
    if (!form.service_cost) e.service_cost = "Service cost is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        date: form.date_of_service,
        cost: form.service_cost,
        notes: form.reason,
      };
      console.log("Create Service Payload:", payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to create service:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      onClick={onClose}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[92%] md:w-full max-w-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Create Service</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Name - Select dropdown */}
          <div className="relative w-full">
            <select
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={`peer w-full p-2 px-4 border rounded-md outline-none transition-all bg-white text-sm
                ${errors.name ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
            >
              <option value="">Select Service</option>
              {SERVICE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <label className={`absolute left-3 px-1 bg-white text-xs -top-2 pointer-events-none ${errors.name ? "text-red-500" : "text-gray-600"}`}>
              Name <span className="text-red-500">*</span>
            </label>
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Date of Service */}
          <FloatingInput
            label="Date of Service"
            type="date"
            value={form.date_of_service}
            onChange={(e) => set("date_of_service", e.target.value)}
            error={errors.date_of_service}
            required
          />

          {/* Service Cost */}
          <FloatingInput
            label={`Service Cost (${currency})`}
            type="number"
            value={form.service_cost}
            onChange={(e) => set("service_cost", e.target.value)}
            error={errors.service_cost}
            required
          />

          {/* Reason for Service */}
          <FloatingLabelTextarea
            label="Reason for Service"
            rows={4}
            value={form.reason}
            onChange={(e) => set("reason", e.target.value)}
          />
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn btn-primary-with-bg"
          >
            {saving ? "Creating..." : "Create Service"}
          </button>
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateServiceModal;
