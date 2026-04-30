const TIME_SLOTS = [
  "07 AM",
  "08 AM",
  "09 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "01 PM",
  "02 PM",
  "03 PM",
  "04 PM",
  "05 PM",
  "06 PM",
  "07 PM",
  "08 PM",
  "09 PM",
];

export function ParklotTimeline() {
  return (
    <div className="grid auto-cols-[70px] grid-flow-col grid-rows-[100%] border-b">
      {TIME_SLOTS.map((time, index) => {
        const [digit, suffix] = time.split(" ");
        return (
          <div
            key={index}
            className="relative flex items-end pb-2.5 text-sm leading-4"
          >
            <div className="absolute bottom-0 -left-px h-[5px] w-0 border-l"></div>
            <div className="-translate-x-2 pr-1 text-xs font-semibold">
              {digit}
            </div>
            <div className="text-muted-foreground -translate-x-2 text-xs">
              {suffix}
            </div>
          </div>
        );
      })}
    </div>
  );
}
