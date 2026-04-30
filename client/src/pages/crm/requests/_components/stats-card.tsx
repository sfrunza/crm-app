import { useGetBookingStats } from '@/domains/requests/request.queries';

export function StatsCard() {
  const { data } = useGetBookingStats();

  const current = data?.booked_this_month ?? 0;
  // const current = 332;
  const goal = data?.booked_last_month ?? 0;
  const percentage = goal > 0 ? Math.round((current / goal) * 100) : 0;
  const clamped = Math.min(percentage, 100);
  const exceeded = current > goal && goal > 0;

  return (
    <div className="px-4">
      <div className="bg-card flex items-center gap-3 rounded-lg border px-3 py-2">
        {/* Current */}
        <div className="flex shrink-0 items-baseline gap-1">
          <span className="text-foreground text-sm font-bold tabular-nums">
            {current}
          </span>
          <span className="text-muted-foreground text-[10px]">booked</span>
        </div>

        {/* Progress bar */}
        <div className="relative flex-1">
          <div className="bg-muted h-1.5 overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                exceeded
                  ? 'bg-linear-to-r from-emerald-400 to-emerald-500'
                  : 'bg-primary'
              }`}
              style={{ width: `${clamped}%` }}
            />
          </div>
        </div>

        {/* Goal */}
        <div className="flex shrink-0 items-baseline gap-1">
          <span className="text-muted-foreground text-sm font-bold tabular-nums">
            {goal}
          </span>
          <span className="text-muted-foreground text-[10px]">goal</span>
        </div>

        {/* Percentage pill */}
        <span
          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            exceeded
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : percentage >= 50
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
}
