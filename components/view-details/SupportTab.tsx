import AdditionalNotes from "@/components/view-details/AdditionalNotes";
import SupportInfoList from "@/components/view-details/SupportInfoList";
import {
  ShieldCheck,
  UtensilsCrossed,
  Wind,
  Star,
  CheckSquare,
  MessageSquare,
  UserCheck,
} from "lucide-react";

// ─── Mock Support Data ────────────────────────────────────────────────────────
const SUPPORT_DATA = {
  policies: ["NA"],
  mealPlan: ["NA"],
  smokingPreference: ["NA"],
  preferences: [],
  tasks: [],
  messages: [],
  guestPreferences: [],
};
// ─────────────────────────────────────────────────────────────────────────────

const SupportTab = () => {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left: Additional Notes (full width top, then 2 cols) */}
      <div className="col-span-2 space-y-4">
        <AdditionalNotes
          onViewHistory={() => console.log("View history")}
        />
      </div>

      {/* Right: Policies + preferences grouped */}
      <div className="col-span-1 space-y-0">
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <SupportInfoList
            title="Policies"
            items={SUPPORT_DATA.policies}
            icon={<ShieldCheck className="w-4 h-4" />}
          />

          <SupportInfoList
            title="Meal Plan"
            items={SUPPORT_DATA.mealPlan}
            icon={<UtensilsCrossed className="w-4 h-4" />}
          />

          <SupportInfoList
            title="Smoking Preference"
            items={SUPPORT_DATA.smokingPreference}
            icon={<Wind className="w-4 h-4" />}
          />

          <SupportInfoList
            title="Preferences"
            items={SUPPORT_DATA.preferences}
            emptyMessage="No Preferences Added"
            icon={<Star className="w-4 h-4" />}
          />

          <SupportInfoList
            title="Tasks"
            items={SUPPORT_DATA.tasks}
            emptyMessage="No Tasks Added"
            icon={<CheckSquare className="w-4 h-4" />}
          />

          <SupportInfoList
            title="Message"
            items={SUPPORT_DATA.messages}
            emptyMessage="No Message Added"
            icon={<MessageSquare className="w-4 h-4" />}
          />

          <SupportInfoList
            title="Guest Preferences"
            items={SUPPORT_DATA.guestPreferences}
            emptyMessage="No Guest Preferences Added"
            icon={<UserCheck className="w-4 h-4" />}
          />
        </div>
      </div>
    </div>
  );
};

export default SupportTab;