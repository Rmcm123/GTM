import type { OrderStatus, WorkOrder } from '../types';
import { Panel } from './Panel';

const statusClass: Record<OrderStatus, string> = {
  Pendiente: 'bg-[#fff7ed] text-[#9a4b00]',
  'En espera': 'bg-[#fef3c7] text-[#92400e]',
  'En revision': 'bg-[#eaf2ff] text-[#1e55a8]',
  'En proceso': 'bg-[#e8f7ef] text-[#0d6848]',
  Finalizada: 'bg-[#e5f7f8] text-[#0f6872]',
  Entregada: 'bg-[#ecfdf5] text-[#047857]',
  Cancelada: 'bg-[#fef2f2] text-[#b91c1c]',
  'Garantia valida': 'bg-[#ecfdf5] text-[#047857]',
};

type OrdersTableProps = {
  title: string;
  helper: string;
  orders: WorkOrder[];
  actionLabel?: string;
  onActionClick?: () => void;
  onRowClick?: (order: WorkOrder) => void;
  selectedOrderId?: string;
};

export function OrdersTable({ title, helper, orders, actionLabel = 'Ver ordenes', onActionClick, onRowClick, selectedOrderId }: OrdersTableProps) {
  return (
    <Panel>
      <div className="mb-[18px] flex flex-col items-start justify-between gap-3.5 md:flex-row md:items-center">
        <div>
          <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Ordenes de trabajo</span>
          <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">{title}</h2>
          <p className="m-[6px_0_0] text-[14px] text-[#64748b]">{helper}</p>
        </div>
        {actionLabel && (
          <button className="min-h-9 rounded-[7px] border border-[#cbd5e1] bg-white px-3.5 text-[14px] font-bold text-[#1f2937] hover:bg-slate-50" onClick={onActionClick} type="button">
            {actionLabel}
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              {['OT', 'Cliente', 'Vehiculo', 'Mecanico', 'Estado', 'Ingreso'].map((heading) => (
                <th className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-left align-middle text-[12px] font-extrabold uppercase text-[#516071]" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                className={onRowClick ? `cursor-pointer transition-colors hover:bg-slate-50 ${selectedOrderId === order.id ? 'bg-[#f0f4f8]' : ''}` : ''}
                key={order.id}
                onClick={() => onRowClick?.(order)}
              >
                <td className="border-b border-[#e5eaf0] p-[13px_10px] text-left align-middle text-[14px]">
                  <strong className="text-[#111827]">{order.id}</strong>
                </td>
                <td className="border-b border-[#e5eaf0] p-[13px_10px] text-left align-middle text-[14px]">{order.client}</td>
                <td className="border-b border-[#e5eaf0] p-[13px_10px] text-left align-middle text-[14px]">{order.vehicle}</td>
                <td className="border-b border-[#e5eaf0] p-[13px_10px] text-left align-middle text-[14px]">{order.mechanic}</td>
                <td className="border-b border-[#e5eaf0] p-[13px_10px] text-left align-middle text-[14px]">
                  <span className={`inline-flex w-fit rounded-full px-2.5 py-1.5 text-[12px] font-extrabold ${statusClass[order.status]}`}>{order.status}</span>
                </td>
                <td className="border-b border-[#e5eaf0] p-[13px_10px] text-left align-middle text-[14px]">{order.checkIn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
