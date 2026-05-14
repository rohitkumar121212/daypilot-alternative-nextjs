"use client";

import { useEffect, useState } from "react";
import FloatingInput from "@/components/common/FloatingInput";

interface Nationality {
  label: string;
  value: string;
}

interface AddNewGuestModalProps {
  onClose: () => void;
  onSave: (guest: {
    full_name: string;
    type: string;
    phone: string;
    email: string;
    nationality: string;
  }) => void;
}

const CATEGORIES = [
  { label: "Adult", value: "adult" },
  { label: "Child", value: "child" },
  { label: "Toddler", value: "toddler" },
];

const FloatingSelect = ({
  label,
  value,
  onChange,
  error,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="relative w-full">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`peer w-full p-2 px-4 border rounded-md outline-none transition-all bg-white text-sm
        ${error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
    >
      {children}
    </select>
    <label className={`absolute left-3 px-1 bg-white text-xs -top-2 pointer-events-none ${error ? "text-red-500" : "text-gray-600"}`}>
      {label}
    </label>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const AddNewGuestModal = ({ onClose, onSave }: AddNewGuestModalProps) => {
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [form, setForm] = useState({
    full_name: "",
    type: "",
    phone: "",
    email: "",
    nationality: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  useEffect(() => {
    fetch("https://aperfectstay.ai/aps-api/v1/constants/")
      .then((r) => r.json())
      .then((json) => setNationalities(json?.data?.nationalities ?? []))
      .catch(() => setNationalities([]));
  }, []);

  const set = (field: string) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const setFromEvent =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const validate = () => {
    const newErrors: Partial<typeof form> = {};
    if (!form.full_name.trim()) newErrors.full_name = "Guest name is required";
    if (!form.type) newErrors.type = "Category is required";
    if (!form.phone.trim()) newErrors.phone = "Contact info is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.nationality) newErrors.nationality = "Nationality is required";
    return newErrors;
  };

  const handleSave = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedNationality = nationalities.find((n) => n.value === form.nationality);
    const payload = {
      additional_guests: {
        add: [
          {
            guest_name: form.full_name.trim(),
            guest_type: form.type.toUpperCase() as "ADULT" | "CHILD" | "TODDLER",
            contact_no: form.phone.trim(),
            email: form.email.trim(),
            nationality: selectedNationality?.label ?? form.nationality,
          },
        ],
      },
    };

    console.log("Add Guest Payload:", payload);

    onSave(form);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[92%] md:w-full max-w-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <h2 className="text-xl font-semibold text-gray-800">Add New Guest</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          {/* Guest Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1 pb-2">
              Guest Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="Guest Name"
                value={form.full_name}
                onChange={setFromEvent("full_name")}
                error={errors.full_name}
                required
              />
              <FloatingSelect
                label="Category"
                value={form.type}
                onChange={set("type")}
                error={errors.type}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </FloatingSelect>
              <FloatingInput
                label="Contact Info"
                value={form.phone}
                onChange={setFromEvent("phone")}
                type="tel"
                error={errors.phone}
                required
              />
              <FloatingInput
                label="Email"
                value={form.email}
                onChange={setFromEvent("email")}
                type="email"
                error={errors.email}
                required
              />
              <FloatingSelect
                label="Nationality"
                value={form.nationality}
                onChange={set("nationality")}
                error={errors.nationality}
              >
                <option value="">Select Nationality</option>
                {nationalities.map((n) => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </FloatingSelect>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-300 pt-4 flex flex-wrap gap-3">
            <button onClick={handleSave} className="btn btn-primary-with-bg">
              Save
            </button>
            <button onClick={onClose} className="btn btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewGuestModal;
