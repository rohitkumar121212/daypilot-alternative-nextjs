import GuestInformation from "@/components/view-details/GuestInformation";

interface GuestDetails {
  full_name: string;
  email: string;
  phone: string;
  occupancy: { adults: string; children: string };
}

interface GuestTabProps {
  guestDetails: GuestDetails;
}

const GuestTab = ({ guestDetails }: GuestTabProps) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <GuestInformation
        fullName={guestDetails.full_name}
        email={guestDetails.email}
        phone={guestDetails.phone}
        adults={Number(guestDetails.occupancy.adults)}
        children={Number(guestDetails.occupancy.children)}
        address=""
      />
    </div>
  );
};

export default GuestTab;