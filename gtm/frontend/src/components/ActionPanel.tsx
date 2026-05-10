import { Panel } from './Panel';

type ActionPanelProps = {
  actions: string[];
  onAction?: (action: string) => void;
};

export function ActionPanel({ actions, onAction }: ActionPanelProps) {
  return (
    <Panel className="grid gap-4">
      <div>
        <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Accesos</span>
        <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Operaciones principales</h2>
      </div>
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-2">
        {actions.map((action) => (
          <button className="min-h-11 rounded-[7px] border border-[#cbd5e1] bg-[#f8fafc] text-[14px] font-bold text-[#1f2937] transition-colors hover:bg-[#eef4f2]" key={action} onClick={() => onAction?.(action)} type="button">
            {action}
          </button>
        ))}
      </div>
    </Panel>
  );
}
