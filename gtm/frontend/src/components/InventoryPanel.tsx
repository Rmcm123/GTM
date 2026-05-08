import type { InventoryItem, StockMovement } from '../types';
import { Panel } from './Panel';

type InventoryPanelProps = {
  items: InventoryItem[];
  movements?: StockMovement[];
  showMovements?: boolean;
};

export function InventoryPanel({ items, movements = [], showMovements = false }: InventoryPanelProps) {
  return (
    <Panel>
      <div className="mb-3 flex flex-col items-start justify-between gap-3.5 md:flex-row md:items-center">
        <div>
          <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Inventario</span>
          <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Stock de repuestos</h2>
        </div>
        <button className="min-h-9 rounded-[7px] border border-[#cbd5e1] bg-white px-3.5 text-[14px] font-bold text-[#1f2937] hover:bg-slate-50" type="button">
          Ver inventario
        </button>
      </div>

      <div className="grid">
        {items.map((item, index) => (
          <div className={`flex justify-between gap-3.5 py-3.5 ${index === 0 ? '' : 'border-t border-[#e5eaf0]'}`} key={item.name}>
            <div className="grid gap-0.5">
              <strong className="text-[14px] font-bold text-[#111827]">{item.name}</strong>
              <span className="text-[14px] text-[#64748b]">{item.category} · Minimo: {item.minimum}</span>
            </div>
            {item.stock < item.minimum ? (
              <span className="self-center whitespace-nowrap rounded-full bg-[#fff3df] px-2.5 py-1 text-[14px] font-extrabold text-[#9a4b00]">
                {item.stock} unidades
              </span>
            ) : (
              <span className="self-center whitespace-nowrap text-[14px] text-[#64748b]">{item.stock} unidades</span>
            )}
          </div>
        ))}
      </div>

      {showMovements && (
        <div className="mt-5 border-t border-[#e5eaf0] pt-4">
          <h3 className="m-0 text-[16px] font-extrabold text-[#111827]">Movimientos recientes</h3>
          <div className="mt-2 grid">
            {movements.map((movement, index) => (
              <div className={`flex justify-between gap-3.5 py-3 ${index === 0 ? '' : 'border-t border-[#e5eaf0]'}`} key={`${movement.item}-${movement.date}-${movement.type}`}>
                <div>
                  <strong className="block text-[14px] text-[#111827]">{movement.item}</strong>
                  <span className="text-[13px] text-[#64748b]">{movement.date}</span>
                </div>
                <span className={movement.type === 'Entrada' ? 'text-[14px] font-bold text-[#0f6b52]' : 'text-[14px] font-bold text-[#9a4b00]'}>
                  {movement.type} · {movement.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}
