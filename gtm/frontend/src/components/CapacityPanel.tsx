import { Panel } from './Panel';

type CapacityPanelProps = {
  occupiedSlots: number;
  totalSlots: number;
};

export function CapacityPanel({ occupiedSlots, totalSlots }: CapacityPanelProps) {
  return (
    <Panel>
      <div className="mb-3 flex items-center justify-between gap-3.5">
        <div>
          <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Capacidad</span>
          <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Cupos del taller</h2>
        </div>
        <strong className="text-[30px] leading-none text-[#111827]">{occupiedSlots}/{totalSlots}</strong>
      </div>
      <div className="grid grid-cols-5 gap-2" aria-label="Cupos disponibles">
        {Array.from({ length: totalSlots }).map((_, index) => (
          <span className={`grid min-h-11 place-items-center rounded-[7px] font-extrabold ${index < occupiedSlots ? 'bg-[#0f6b52] text-white' : 'border border-dashed border-[#9bc9b6] bg-[#effaf4] text-[#0f6b52]'}`} key={index}>
            {index + 1}
          </span>
        ))}
      </div>
    </Panel>
  );
}
