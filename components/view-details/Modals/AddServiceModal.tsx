"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { fetchUtils } from "@/utils/fetchUtils";
import { useUser } from "@/contexts/UserContext";
import FloatingInput from "@/components/common/FloatingInput";
import FloatingDropdown from "@/components/common/FloatingDropdown";
import FloatingLabelTextarea from "@/components/common/FloatingLabelTextarea";
import LoadingOverlay from "@/components/ReservationChart/Modals/CreateBookingModal/components/LoadingOverlay";

export interface ExtraService {
  id?: string;
  service_name?: string;
  service_type?: string | { code: string; label: string };
  pricing_mode?: string | { code: string; label: string };
  amount?: string | number | { unit_amount?: number; [key: string]: unknown };
  nightly_amount?: string | number;
  notes?: string;
  payment_status?: string | { code: string; label: string };
  payment_method?: string | { code: string; label: string };
  created_at?: string;
  occurred_at?: string;
  reference_number?: string;
  [key: string]: unknown;
}

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | number;
  currency?: string;
  onSuccess?: () => void;
  editingService?: ExtraService | null;
}

const BASE_URL = "https://aperfectstay.ai/aps-api/v1";
const today = new Date().toISOString().split("T")[0];

type Option = { value: string; label: string };

const FALLBACK_SERVICE_TYPES: Option[] = [
  { value: "ADDITIONAL_SERVICES", label: "Additional Services" },
  { value: "FINE", label: "Fine" },
  { value: "SECURITY_DEPOSIT", label: "Security Deposit" },
  { value: "ADVANCE_PAYMENT", label: "Advance Payment" },
  { value: "OTHERS", label: "Others" },
];

const FALLBACK_PRICING_MODES: Option[] = [
  { value: "ONE_OFF", label: "One-off (Flat Charge)" },
  { value: "NIGHTLY", label: "Nightly (Per Night)" },
];

const FALLBACK_PAYMENT_STATUSES: Option[] = [
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
];

const FALLBACK_PAYMENT_METHODS: Option[] = [
  { value: "PAYPAL", label: "PayPal" },
  { value: "CASH", label: "Cash" },
  { value: "CREDIT", label: "Credit" },
  { value: "PAYMENT_GATEWAY", label: "Payment Gateway" },
];

const SERVICE_NAME_REQUIRED_TYPES = new Set(["ADDITIONAL_SERVICES", "FINE", "OTHERS"]);

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PAID: ["PENDING"],
  PENDING: ["PAID"],
  REFUNDED: [],
};

// Handles both flat string and nested { code, label } from API responses
const resolveCode = (val: unknown): string => {
  if (!val) return "";
  if (typeof val === "object" && val !== null && "code" in val)
    return String((val as { code: unknown }).code);
  return String(val);
};

const resolveUnitAmount = (val: unknown): string => {
  if (!val) return "";
  if (typeof val === "object" && val !== null && "unit_amount" in val)
    return String((val as { unit_amount?: number }).unit_amount ?? "");
  return String(val);
};

const buildForm = (svc?: ExtraService | null) => {
  const pricingMode = resolveCode(svc?.pricing_mode).toUpperCase() ||
    (svc?.nightly_amount != null && String(svc.nightly_amount) !== "" ? "NIGHTLY" :
      svc?.amount != null ? "ONE_OFF" : "");

  return {
    occurred_at: ((svc?.occurred_at ?? svc?.created_at) ?? today).toString().split("T")[0],
    service_type: resolveCode(svc?.service_type).toUpperCase(),
    service_name: svc?.service_name ?? "",
    pricing_mode: pricingMode,
    oneoff_amount: pricingMode === "ONE_OFF" ? resolveUnitAmount(svc?.amount) : "",
    nightly_amount: pricingMode === "NIGHTLY"
      ? (svc?.nightly_amount != null ? String(svc.nightly_amount) : "")
      : "",
    payment_status: resolveCode(svc?.payment_status).toUpperCase(),
    payment_method: resolveCode(svc?.payment_method).toUpperCase(),
    reference_number: svc?.reference_number !== "NA" ? (svc?.reference_number ?? "") : "",
    notes: svc?.notes !== "NA" ? (svc?.notes ?? "") : "",
  };
};

const AddServiceModal = ({
  isOpen,
  onClose,
  bookingId,
  currency = "£",
  onSuccess,
  editingService,
}: AddServiceModalProps) => {
  const isEditing = !!editingService;
  const { user } = useUser();
  const bookedByEmail = user?.user_details?.email ?? user?.email ?? "";

  const [catalogue, setCatalogue] = useState<Option[]>([]);
  const [serviceTypeOptions, setServiceTypeOptions] = useState<Option[]>(FALLBACK_SERVICE_TYPES);
  const [pricingModeOptions, setPricingModeOptions] = useState<Option[]>(FALLBACK_PRICING_MODES);
  const [paymentStatusOptions, setPaymentStatusOptions] = useState<Option[]>(FALLBACK_PAYMENT_STATUSES);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<Option[]>(FALLBACK_PAYMENT_METHODS);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => buildForm(editingService));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const originalFormRef = useRef<ReturnType<typeof buildForm> | null>(null);

  const serviceNameRequired = SERVICE_NAME_REQUIRED_TYPES.has(form.service_type);
  const showPaymentMethod = form.payment_status === "PAID";

  const allowedPaymentStatuses = useMemo(() => {
    if (!isEditing) return paymentStatusOptions;
    const currentCode = resolveCode(editingService?.payment_status).toUpperCase();
    if (!currentCode) return paymentStatusOptions;
    const allowed = STATUS_TRANSITIONS[currentCode] ?? [];
    return paymentStatusOptions.filter(
      (o) => o.value === currentCode || allowed.includes(o.value)
    );
  }, [isEditing, editingService, paymentStatusOptions]);

  useEffect(() => {
    if (isOpen) {
      const original = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const initial = buildForm(editingService);
    setForm(initial);
    if (isEditing) originalFormRef.current = initial;
    setErrors({});

    // For enum fields (service_type, pricing_mode, payment_status, payment_method)
    // — value is always uppercased so it matches form state and STATUS_TRANSITIONS keys
    const toEnumOptions = (arr: any[]): Option[] =>
      Array.isArray(arr)
        ? arr.map((item) =>
            typeof item === "string"
              ? { value: item.toUpperCase(), label: item }
              : { value: String(item?.value ?? item?.code ?? item?.id ?? item).toUpperCase(), label: String(item?.label ?? item?.name ?? item) }
          )
        : [];

    Promise.all([
      fetchUtils.get(`${BASE_URL}/booking-addons/metadata`),
      fetchUtils.get(`${BASE_URL}/booking-addons/catalogue`),
    ])
      .then(([{ data: metaResp }, { data: catResp }]) => {
        const meta = metaResp?.data ?? metaResp ?? {};

        const items: any[] = catResp?.data?.items ?? catResp?.items ?? catResp?.data ?? catResp ?? [];
        if (Array.isArray(items)) {
          setCatalogue(items.map((item) => ({
            value: String(item?.label ?? item?.code ?? item),
            label: String(item?.label ?? item?.code ?? item),
          })));
        }

        const st = toEnumOptions(meta?.service_types ?? meta?.serviceTypes ?? []);
        const pm = toEnumOptions(meta?.pricing_modes ?? meta?.pricingModes ?? []);
        const ps = toEnumOptions(meta?.payment_statuses ?? meta?.paymentStatuses ?? []);
        const pmeth = toEnumOptions(meta?.payment_methods ?? meta?.paymentMethods ?? []);

        if (st.length) setServiceTypeOptions(st);
        if (pm.length) setPricingModeOptions(pm);
        if (ps.length) setPaymentStatusOptions(ps);
        if (pmeth.length) setPaymentMethodOptions(pmeth);
      })
      .catch((err) => console.error("Failed to fetch addon metadata:", err));
  }, [isOpen, editingService]);

  const set = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "payment_method" && value === "CREDIT") {
        next.payment_status = "PAID";
      }
      if (field === "payment_status" && value === "PENDING") {
        next.payment_method = "";
      }
      if (field === "pricing_mode") {
        next.oneoff_amount = "";
        next.nightly_amount = "";
      }

      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.service_type) e.service_type = "Service type is required";
    if (serviceNameRequired && !form.service_name) e.service_name = "Service name is required";
    if (!form.pricing_mode) e.pricing_mode = "Pricing mode is required";
    if (form.pricing_mode === "ONE_OFF") {
      if (!form.oneoff_amount) e.oneoff_amount = "One-off amount is required";
      else if (parseFloat(form.oneoff_amount) <= 0) e.oneoff_amount = "Amount must be greater than 0";
    }
    if (form.pricing_mode === "NIGHTLY") {
      if (!form.nightly_amount) e.nightly_amount = "Nightly amount is required";
      else if (parseFloat(form.nightly_amount) <= 0) e.nightly_amount = "Amount must be greater than 0";
    }
    if (!form.payment_status) e.payment_status = "Payment status is required";
    if (form.payment_status === "PAID" && !form.payment_method)
      e.payment_method = "Payment method is required when status is Paid";
    if (form.occurred_at && form.occurred_at > today)
      e.occurred_at = "Date cannot be in the future";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        occurred_at: form.occurred_at || today,
        service_type: form.service_type,
        pricing_mode: form.pricing_mode,
        payment_status: form.payment_status,
      };

      if (serviceNameRequired || form.service_name) {
        payload.service_name = form.service_name;
      }

      if (form.pricing_mode === "ONE_OFF") {
        payload.oneoff_amount = parseFloat(form.oneoff_amount);
      } else if (form.pricing_mode === "NIGHTLY") {
        payload.nightly_amount = parseFloat(form.nightly_amount);
      }

      // payment_method must NOT be sent when status is PENDING
      if (form.payment_status === "PAID") {
        payload.payment_method = form.payment_method;
      }

      if (form.reference_number) payload.reference_number = form.reference_number;
      if (form.notes) payload.notes = form.notes;

      if (isEditing && editingService?.id) {
        const orig = originalFormRef.current!;
        const patch: Record<string, unknown> = {};
        const amountFields = new Set(["oneoff_amount", "nightly_amount"]);
        const nullableFields = new Set(["reference_number", "notes"]);

        for (const key of Object.keys(form) as (keyof typeof form)[]) {
          if (form[key] !== orig[key]) {
            if (amountFields.has(key)) {
              patch[key] = form[key] === "" ? null : parseFloat(form[key] as string);
            } else if (nullableFields.has(key)) {
              patch[key] = form[key] === "" ? null : form[key];
            } else {
              patch[key] = form[key] || null;
            }
          }
        }

        // If pricing_mode changed, always include the matching amount
        if ("pricing_mode" in patch) {
          if (form.pricing_mode === "ONE_OFF" && !("oneoff_amount" in patch))
            patch.oneoff_amount = parseFloat(form.oneoff_amount) || null;
          if (form.pricing_mode === "NIGHTLY" && !("nightly_amount" in patch))
            patch.nightly_amount = parseFloat(form.nightly_amount) || null;
        }

        // Changing to PAID requires payment_method in the patch
        if (patch.payment_status === "PAID" && !("payment_method" in patch)) {
          patch.payment_method = form.payment_method;
        }

        // const testAddOn='ahNhcGVyZmVjdHN0YXktMjE1NDA4ciULEhhBcDEwQm9va2luZ0V4dHJhU2VydmljZXMYgIDA4uGHyAsM'
        await fetchUtils.post(
          // `${BASE_URL}/bookings/${bookingId}/addons/${testAddOn}`,
          `${BASE_URL}/bookings/${bookingId}/addons/${editingService.id}`,
          patch,
          { method: "PATCH" } as RequestInit
        );
      } else {
        await fetchUtils.post(`${BASE_URL}/bookings/${bookingId}/addons`, payload);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to save addon:", err);
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
        className="bg-white rounded-lg shadow-xl w-[92%] md:w-full max-w-4xl h-[87vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? "Edit Extra Service" : "Add Extra Services / Add Ons"}
          </h2>
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4 relative h-full">
            <LoadingOverlay isLoading={saving} />

            {/* Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FloatingInput
                  label="Date of Service"
                  type="date"
                  value={form.occurred_at}
                  onChange={(e) => set("occurred_at", e.target.value)}
                  error={errors.occurred_at}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Cannot be a future date. Defaults to today if not selected.
                </p>
              </div>
            </div>

            {/* Service Type + Service Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingDropdown
                label="Service Type"
                options={serviceTypeOptions}
                value={form.service_type}
                onChange={(v) => set("service_type", v)}
                error={errors.service_type}
                required
              />
              <FloatingDropdown
                label="Service Name"
                options={catalogue}
                value={form.service_name}
                onChange={(v) => set("service_name", v)}
                error={errors.service_name}
                required={serviceNameRequired}
              />
            </div>

            {/* Pricing Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingDropdown
                label="Pricing Mode"
                options={pricingModeOptions}
                value={form.pricing_mode}
                onChange={(v) => set("pricing_mode", v)}
                error={errors.pricing_mode}
                required
              />
              {/* Amount — shown only after pricing mode is selected */}
              {form.pricing_mode === "ONE_OFF" && (
                <FloatingInput
                  label={`One-off Amount (in ${currency})`}
                  type="number"
                  value={form.oneoff_amount}
                  onChange={(e) => set("oneoff_amount", e.target.value)}
                  error={errors.oneoff_amount}
                  required
                />
              )}
              {form.pricing_mode === "NIGHTLY" && (
                <FloatingInput
                  label={`Nightly Amount (in ${currency})`}
                  type="number"
                  value={form.nightly_amount}
                  onChange={(e) => set("nightly_amount", e.target.value)}
                  error={errors.nightly_amount}
                  required
                />
              )}
            </div>

            {/* Payment Status + Payment Method (only when PAID) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingDropdown
                label="Payment Status"
                options={allowedPaymentStatuses}
                value={form.payment_status}
                onChange={(v) => set("payment_status", v)}
                error={errors.payment_status}
                required
              />
              {showPaymentMethod && (
                <FloatingDropdown
                  label="Payment Method"
                  options={paymentMethodOptions}
                  value={form.payment_method}
                  onChange={(v) => set("payment_method", v)}
                  error={errors.payment_method}
                  required
                />
              )}
            </div>

            {/* Reference Number + Booked By */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="Payment Reference No."
                value={form.reference_number}
                onChange={(e) => set("reference_number", e.target.value)}
              />
              <FloatingInput
                label="Service Booked By"
                value={bookedByEmail}
                onChange={() => {}}
                readOnly
              />
            </div>

            {/* Notes */}
            <FloatingLabelTextarea
              label="Notes"
              rows={4}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />

            {/* Buttons */}
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="btn btn-primary-with-bg">
                {isEditing ? "Update Details" : "Save Details"}
              </button>
              <button onClick={onClose} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;
