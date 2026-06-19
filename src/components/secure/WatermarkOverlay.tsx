type WatermarkOverlayProps = {
  label: string;
};

export function WatermarkOverlay({ label }: WatermarkOverlayProps) {
  const items = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 grid grid-cols-2 gap-8 p-4 opacity-[0.12]">
        {items.map((item) => (
          <div
            key={item}
            className="flex rotate-[-24deg] items-center justify-center text-center text-[11px] font-semibold uppercase tracking-wide text-slate-900"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-3 z-30 text-center text-[10px] font-medium text-slate-500">
        View only · Not for download or sharing
      </div>
    </div>
  );
}
