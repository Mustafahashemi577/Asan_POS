export default function Journals() {
  const JOURNAL_STATS = [
    {
      label: "Total Purchases",
      value: "134",
      pct: "4.1%",
      pctColor: "text-green-400",
      date: "Wednesday, 06 May 2026",
      sub: "8 this week",
    },
    {
      label: "Total Spent",
      value: "AFN 2.4M",
      pct: "1.8%",
      pctColor: "text-orange-400",
      date: "Wednesday, 06 May 2026",
      sub: "AFN 380K this month",
    },
    {
      label: "This Month",
      value: "23",
      pct: "",
      pctColor: "",
      date: "Wednesday, 06 May 2026",
      sub: "AFN 380,000",
    },
  ];

  return (
    <div className="max-w-[1401px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* Stats */}
      <div className="bg-gradient-to-t from-bg-dark via-bg-dark to-bg-dark/90 w-full rounded-2xl p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-white text-xl sm:text-2xl font-semibold">
            Journal Overview
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Track journals for your business
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {JOURNAL_STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 border border-white/10 rounded-xl p-4"
            >
              <p className="text-gray-300 text-xs mb-2">{stat.label}</p>
              <div className="flex items-end justify-between mb-3">
                <p className="text-white text-lg sm:text-xl font-semibold leading-tight">
                  {stat.value}
                </p>
                {stat.pct && (
                  <span
                    className={`text-xs font-medium ${stat.pctColor} bg-white/10 px-1.5 py-0.5 rounded`}
                  >
                    {stat.pct}
                  </span>
                )}
              </div>
              <hr className="border-white/10 mb-2" />
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-[10px]">{stat.date}</span>
                <span className="text-gray-400 text-xs">{stat.sub}</span>
              </div>
              <button className="text-gray-500 text-[10px] mt-1.5 hover:text-gray-300 transition block">
                View all &rsaquo;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
