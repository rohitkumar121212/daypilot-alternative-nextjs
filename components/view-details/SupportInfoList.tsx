import { Dot } from "lucide-react";

interface SupportInfoListProps {
  title: string;
  items: string[];
  emptyMessage?: string;
  icon?: React.ReactNode;
}

const SupportInfoList = ({ title, items, emptyMessage, icon }: SupportInfoListProps) => {
  const displayItems = items.length > 0 ? items : [emptyMessage ?? "No data added"];
  const isEmpty = items.length === 0;

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        <h4 className="text-sm font-bold text-slate-700">{title}</h4>
      </div>
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        {displayItems.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b border-slate-100 last:border-0 ${
              isEmpty ? "text-slate-400 italic" : "text-slate-700"
            } ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
          >
            <Dot className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportInfoList;