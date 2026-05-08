import { Panel } from './Panel';

type WorkflowPanelProps = {
  items: { status: string; count: number }[];
};

export function WorkflowPanel({ items }: WorkflowPanelProps) {
  return (
    <Panel>
      <div className="mb-3">
        <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Flujo</span>
        <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Estados de OT</h2>
      </div>
      <div className="grid">
        {items.map((item, index) => (
          <div className={`flex justify-between gap-3.5 py-3.5 ${index === 0 ? '' : 'border-t border-[#e5eaf0]'}`} key={item.status}>
            <span className="text-[14px] text-[#64748b]">{item.status}</span>
            <strong className="text-[14px] font-bold text-[#111827]">{item.count}</strong>
          </div>
        ))}
      </div>
    </Panel>
  );
}
