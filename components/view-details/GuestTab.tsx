import GuestInformation from "@/components/view-details/GuestInformation";
import PropertyDetails from "@/components/view-details/PropertyDetails";

// ─── Mock Guest Data ──────────────────────────────────────────────────────────
const GUEST_DATA = {
  fullName: "Christopher Raspin",
  email: "chris.s.raspin@gsk.com",
  phone: "+447788207484",
  adults: 1,
  children: 0,
  address: "GSK Corporate Housing, Brentford, Middlesex, London, TW8 9GS",
};

const PROPERTY_DATA = {
  propertyName: "A Perfect 10 — 33 TT",
  address: "33 Tottenham Court Road, London, W1T 1BJ",
  unitType: "1 bedroom, 3rd Floor",
};
// ─────────────────────────────────────────────────────────────────────────────

const GuestTab = () => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <GuestInformation {...GUEST_DATA} />
      <PropertyDetails {...PROPERTY_DATA} />
    </div>
  );
};

export default GuestTab;