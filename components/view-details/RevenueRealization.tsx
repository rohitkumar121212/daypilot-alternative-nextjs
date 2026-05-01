import { TrendingUp } from "lucide-react";

interface RevenueRealizationProps {
  rows: Record<string, unknown>[];
  totals: {
    count_realized: number;
    total_booked: number;
    total_nights: number;
    total_realized: number;
  };
  currency?: string;
}

const RevenueRealization = ({ rows, totals, currency = "£" }: RevenueRealizationProps) => {
  const progress =
    totals.total_booked > 0
      ? (totals.total_realized / totals.total_booked) * 100
      : 0;

  const isEmpty = totals.total_booked === 0 && rows.length === 0;

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 bg-rose-50 rounded-lg">
          <TrendingUp className="w-4 h-4 text-rose-500" />
        </div>
        <h2 className="text-base font-semibold text-slate-800">Revenue Realization</h2>
        {!isEmpty && (
          <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {totals.count_realized} realized
          </span>
        )}
      </div>

      {isEmpty ? (
        <p className="text-sm text-slate-400 text-center py-6">No revenue realization data available</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-slate-50 rounded-xl p-3.5">
              <p className="text-xs text-slate-400 mb-1">Total Booked</p>
              <p className="text-base font-bold text-slate-900">
                {currency}{totals.total_booked.toFixed(2)}
              </p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3.5">
              <p className="text-xs text-emerald-600 mb-1">Total Realized</p>
              <p className="text-base font-bold text-emerald-700">
                {currency}{totals.total_realized.toFixed(2)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5">
              <p className="text-xs text-slate-400 mb-1">Total Nights</p>
              <p className="text-base font-bold text-slate-900">{totals.total_nights}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5">
              <p className="text-xs text-slate-400 mb-1">Periods Realized</p>
              <p className="text-base font-bold text-slate-900">{totals.count_realized}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-slate-400">Realization Progress</p>
              <p className="text-xs font-semibold text-slate-700">{progress.toFixed(1)}%</p>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {rows.length > 0 && (
            <div className="mt-5 space-y-2.5">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="flex flex-wrap gap-x-6 gap-y-2 py-3 border-b border-slate-50 last:border-0"
                >
                  {Object.entries(row).map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-slate-400 capitalize">{k.replace(/_/g, " ")}</p>
                      <p className="text-sm font-medium text-slate-800">{String(v ?? "—")}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RevenueRealization;
