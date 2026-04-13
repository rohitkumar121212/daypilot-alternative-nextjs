"use client";

import { useState } from "react";
import { BadgePoundSterling, ArrowRight, Pencil, Check, X } from "lucide-react";
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
  onSave?: (data: FormState) => void;
}

interface FormState {
  rentPerNight: string;
  otherCharges: string;
  commissionPercent: string;
  commissionPayable: string;
  securityDeposit: string;
  revenueAgainstCancellation: string;
  amountPaid: string;
  discount: string;
}

// ── Shared row shell ──────────────────────────────────────────────────────────
interface RowProps {
  label: string;
  value: React.ReactNode;
  shaded?: boolean;
  bold?: boolean;
  labelColor?: string;
}

const Row = ({ label, value, shaded, bold, labelColor }: RowProps) => (
  <tr className={shaded ? "bg-slate-50" : "bg-white"}>
    <td
      className={`px-4 py-3 text-sm border border-slate-200 w-44 align-middle ${bold ? "font-bold" : "font-medium"
        } ${labelColor ?? "text-slate-700"}`}
    >
      {label}
    </td>
    <td className="px-4 py-3 text-sm border border-slate-200 text-slate-800">
      {value}
    </td>
  </tr>
);

// ── Editable number cell ──────────────────────────────────────────────────────
interface EditableCellProps {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  prefix?: string;
}

const EditableCell = ({ value, onChange, disabled, prefix }: EditableCellProps) => {
  if (disabled) {
    return (
      <div className="inline-block bg-white border border-slate-200 rounded px-3 py-1.5 text-sm text-slate-700 min-w-[130px]">
        {prefix ? `${prefix} ` : ""}{value}
      </div>
    );
  }
  return (
    <div className="relative inline-flex items-center min-w-[130px]">
      {prefix && (
        <span className="absolute left-3 text-sm text-slate-400 pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full text-sm text-slate-800 bg-white border border-rose-300 rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 transition-all ${prefix ? "pl-6" : ""
          }`}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

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
  onSave,
}: PaymentDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const initialForm: FormState = {
    rentPerNight: rentPerNight.toFixed(2),
    otherCharges: String(otherCharges),
    commissionPercent: String(commissionPercent),
    commissionPayable: commissionPayable.toFixed(1),
    securityDeposit: String(securityDeposit),
    revenueAgainstCancellation: revenueAgainstCancellation.toFixed(1),
    amountPaid: String(amountPaid),
    discount: String(discount),
  };

  const [form, setForm] = useState<FormState>(initialForm);
  const [snapshot, setSnapshot] = useState<FormState>(initialForm);

  // Derived computed values
  const derivedRoomTariff = (parseFloat(form.rentPerNight) || 0) * totalNights;
  const derivedTotal =
    derivedRoomTariff +
    addOns +
    (parseFloat(form.otherCharges) || 0) +
    taxesExclusive +
    (parseFloat(form.commissionPayable) || 0) +
    (parseFloat(form.securityDeposit) || 0);
  const derivedBalance =
    derivedTotal -
    (parseFloat(form.amountPaid) || 0) -
    (parseFloat(form.discount) || 0);

  const displayTotal = isEditing ? derivedTotal : total;
  const displayBalance = isEditing ? derivedBalance : balance;

  const set = (key: keyof FormState) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleEdit = () => {
    setSnapshot(form);
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    onSave?.(form);
  };

  const handleCancel = () => {
    setForm(snapshot);
    setIsEditing(false);
  };

  const currencyLabel = currency === "£" ? "GBP" : currency;

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full border-2 border-rose-500 flex items-center justify-center">
            <BadgePoundSterling className="w-4 h-4 text-rose-500" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            Payment Details ({currencyLabel})
          </h2>
        </div>

        {/* Edit / Save / Cancel */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border border-slate-200 w-44">
                Item
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border border-slate-200">
                Sub Total
              </th>
            </tr>
          </thead>
          <tbody>

            {/* Rent Per Night — editable */}
            <Row
              label="Rent Per Night"
              value={
                <EditableCell
                  value={form.rentPerNight}
                  onChange={set("rentPerNight")}
                  disabled={!isEditing}
                />
              }
            />

            {/* Rent Per Night * Duration — derived */}
            <Row
              shaded
              label="Rent Per Night * Duration"
              value={
                <span className="text-sm text-slate-700">
                  <span className="font-semibold">
                    {currency} {parseFloat(form.rentPerNight || "0").toFixed(2)}
                  </span>
                  {" x "}
                  <span className="font-semibold">{totalNights} Nights</span>
                </span>
              }
            />

            {/* Room Tariff — auto-derived when editing */}
            <Row
              label="Room Tariff"
              value={
                <span className="font-semibold text-slate-900">
                  {currency}{" "}
                  {isEditing ? derivedRoomTariff.toFixed(2) : roomTariff.toFixed(2)}
                </span>
              }
            />

            {/* Add-ons — static */}
            <Row
              shaded
              label="Add-ons"
              value={<span className="text-slate-600">{addOns.toFixed(2)}</span>}
            />

            {/* Other Charges — editable */}
            <Row
              label="Other Charges"
              value={
                <EditableCell
                  value={form.otherCharges}
                  onChange={set("otherCharges")}
                  disabled={!isEditing}
                />
              }
            />

            {/* Taxes Exclusive — static */}
            <Row
              shaded
              label="Taxes (Exclusive)"
              value={
                <span className="font-semibold text-slate-900">
                  {currency} {taxesExclusive}
                </span>
              }
            />

            {/* Taxes Inclusive — static */}
            <Row
              label="Taxes (Inclusive)"
              value={
                <span className="font-semibold text-slate-900">
                  {currency} {taxesInclusive}
                </span>
              }
            />

            {/* Total Taxes — static */}
            <Row
              shaded
              label="Total Tax(es)"
              value={<span className="text-slate-600">{totalTaxes}</span>}
            />

            {/* Commission Percent — editable */}
            <Row
              label="Commission Percent"
              value={
                <EditableCell
                  value={form.commissionPercent}
                  onChange={set("commissionPercent")}
                  disabled={!isEditing}
                />
              }
            />

            {/* Commission Payable — editable */}
            <Row
              shaded
              label="Commission Payable"
              value={
                <EditableCell
                  value={form.commissionPayable}
                  onChange={set("commissionPayable")}
                  disabled={!isEditing}
                />
              }
            />

            {/* Security Deposit — editable */}
            <Row
              label="Security Deposit"
              value={
                <EditableCell
                  value={form.securityDeposit}
                  onChange={set("securityDeposit")}
                  disabled={!isEditing}
                />
              }
            />

            {/* Revenue Against Cancellation — editable */}
            <Row
              shaded
              label="Revenue Against Cancellation"
              value={
                <EditableCell
                  value={form.revenueAgainstCancellation}
                  onChange={set("revenueAgainstCancellation")}
                  disabled={!isEditing}
                />
              }
            />

            {/* Spacer */}
            <tr>
              <td colSpan={2} className="py-1 border border-slate-200 bg-white" />
            </tr>

            {/* Total — derived when editing */}
            <tr className="bg-rose-50">
              <td className="px-4 py-3.5 text-sm font-bold border border-rose-100 text-slate-800">
                Total
              </td>
              <td className="px-4 py-3.5 border border-rose-100">
                <div className="inline-block bg-white border border-slate-200 rounded px-3 py-1.5 text-sm font-semibold text-slate-800 min-w-[130px]">
                  {displayTotal.toFixed(2)}
                </div>
              </td>
            </tr>

            {/* Amount Paid — editable */}
            <tr className="bg-white">
              <td className="px-4 py-3 text-sm font-bold border border-slate-200 w-44 text-rose-600">
                Amount Paid
              </td>
              <td className="px-4 py-3 text-sm border border-slate-200">
                <EditableCell
                  value={form.amountPaid}
                  onChange={set("amountPaid")}
                  disabled={!isEditing}
                />
              </td>
            </tr>

            {/* Discount — editable */}
            <Row
              shaded
              label="Discount"
              value={
                <EditableCell
                  value={form.discount}
                  onChange={set("discount")}
                  disabled={!isEditing}
                />
              }
            />

            {/* Balance — derived when editing */}
            <tr className="bg-white">
              <td className="px-4 py-4 border border-slate-200">
                <span className="text-sm font-bold text-slate-900">Balance</span>
              </td>
              <td className="px-4 py-4 border border-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <span className={`text-base font-extrabold ${isEditing ? "text-rose-500" : "text-rose-600"}`}>
                    {currency} {displayBalance.toFixed(2)}
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