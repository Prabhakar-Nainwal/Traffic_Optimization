import { CalendarDays, CheckCircle, AlertTriangle, XCircle, BarChart4 } from "lucide-react"

const StatCard = ({ icon: Icon, label, value, colorClass, hoverColorClass }) => {
  return (
    <div
      className={`group relative flex flex-col items-start justify-between p-5 rounded-xl border transition-all duration-300 ease-out cursor-pointer ${colorClass} ${hoverColorClass} hover:scale-105 hover:shadow-lg`}
    >
      {/* Background glow effect on hover */}
      <div
        className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10 ${colorClass}`}
      ></div>

      {/* Top section: icon + label */}
      <div className="flex items-center gap-2 w-full relative z-10 flex-wrap sm:flex-nowrap">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all duration-300 group-hover:scale-110 ${colorClass}`}
        >
          <Icon size={20} className="relative z-10" />
        </div>
        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider opacity-90 group-hover:opacity-100 transition-opacity break-words max-w-[80%]">
          {label}
        </span>
      </div>

      {/* Bottom section: value */}
      <p className="text-2xl sm:text-3xl md:text-4xl font-bold relative z-10 group-hover:text-opacity-100 transition-all duration-300 mt-2 break-words">
        {value}
      </p>
    </div>
  )
}


const StatsDisplayBox = ({ type, busiest, loading, data }) => {
  if (loading || !data || data.length === 0 || !busiest) {
    return null
  }

  return (
    <div className="mt-8 group/container">
      <div className="relative bg-white rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl border border-slate-100 hover:border-indigo-200">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-cyan-600/0 to-indigo-600/0 group-hover/container:from-indigo-600/5 group-hover/container:via-cyan-600/5 group-hover/container:to-indigo-600/5 transition-all duration-500 pointer-events-none"></div>

        <div className="relative flex flex-col lg:flex-row items-stretch gap-0">
          {/* === HEADER SECTION: Main Insight === */}
          <div className="lg:w-2/5 bg-gradient-to-br from-slate-800 to-slate-900 p-8 md:p-10 text-white flex flex-col justify-center rounded-t-2xl lg:rounded-t-none lg:rounded-l-2xl relative overflow-hidden group/header">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10 group-hover/header:opacity-20 transition-opacity duration-500">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl opacity-0 group-hover/header:opacity-10 transition-opacity duration-500 animate-pulse"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-indigo-100 font-medium text-sm mb-4 group-hover/header:text-white transition-colors duration-300">
                <CalendarDays
                  size={16}
                  className="flex-shrink-0 group-hover/header:rotate-12 transition-transform duration-500"
                />
                <span>{type === "day" ? "Busiest Day" : type === "month" ? "Busiest Month" : "Busiest Year"}</span>
              </div>
              <div>
                <p className="text-5xl lg:text-6xl font-bold tracking-tight mb-3 group-hover/header:scale-105 transition-transform duration-300 origin-left">
                  {busiest.label}
                </p>
                <p className="text-lg text-indigo-50 font-light group-hover/header:text-white transition-colors duration-300">
                  {busiest.total.toLocaleString()} total vehicles
                </p>
              </div>
            </div>
          </div>

          {/* === STATS GRID SECTION: Horizontal Stat Cards === */}
          <div className="lg:w-3/5 p-8 md:p-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {/* Allowed - Emerald */}
              <StatCard
                icon={CheckCircle}
                label="Allowed"
                value={busiest.allowed}
                colorClass="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 text-emerald-900"
                hoverColorClass="hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-400 hover:text-emerald-950"
              />

              {/* Warned - Amber */}
              <StatCard
                icon={AlertTriangle}
                label="Warned"
                value={busiest.warned}
                colorClass="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 text-amber-900"
                hoverColorClass="hover:from-amber-100 hover:to-amber-200 hover:border-amber-400 hover:text-amber-950"
              />

              {/* Ignored - Rose */}
              <StatCard
                icon={XCircle}
                label="Ignored"
                value={busiest.ignored}
                colorClass="bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200 text-rose-900"
                hoverColorClass="hover:from-rose-100 hover:to-rose-200 hover:border-rose-400 hover:text-rose-950"
              />

              {/* Total - Slate */}
              <StatCard
                icon={BarChart4}
                label="Total"
                value={busiest.total}
                colorClass="bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200 text-slate-900"
                hoverColorClass="hover:from-slate-100 hover:to-slate-200 hover:border-slate-400 hover:text-slate-950"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsDisplayBox
