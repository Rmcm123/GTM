import { ActionPanel } from '../components/ActionPanel';
import { Panel } from '../components/Panel';
import { OrdersTable } from '../components/OrdersTable';
import { PaymentsPanel } from '../components/PaymentsPanel';
import { ReceptionPanel } from '../components/ReceptionPanel';
import { SummaryCards } from '../components/SummaryCards';
import { VehiclesPanel } from '../components/VehiclesPanel';
import { WorkOrdersPanel } from '../components/WorkOrdersPanel';
import type { CrearClientePayload } from '../api/clientesApi';
import type { CrearOrdenTrabajoPayload } from '../api/ordenesTrabajoApi';
import type { RegistrarPagoPayload } from '../api/pagosApi';
import { receptionSummary, roleConfig } from '../data/mockData';
import type { Cliente, InventoryItem, WorkOrder } from '../types';

export function ReceptionDashboard({
  ordenes,
  onNavigate,
}: {
  ordenes: WorkOrder[];
  onNavigate: (section: string) => void;
}) {
  const receptionOrders = ordenes.filter(
    (order) => order.status === 'Pendiente' || order.status === 'En revision',
  );
  const ordenesEspera = ordenes.filter((o) => o.status === 'En espera');

  return (
    <>
      <SummaryCards cards={receptionSummary} />
      {ordenesEspera.length > 0 && (
        <div className="mb-[18px] rounded-[8px] border border-[#fef3c7] bg-[#fffbeb] p-4">
          <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[12px] font-extrabold uppercase text-[#b45309]">Aviso: Órdenes en espera</span>
            <button
              className="w-fit rounded-[7px] border border-[#b45309] bg-white px-3 py-1.5 text-[13px] font-bold text-[#b45309] hover:bg-[#fff7ed]"
              onClick={() => onNavigate('Lista de Espera')}
              type="button"
            >
              Ver lista de espera
            </button>
          </div>
          <p className="m-0 text-[14px] font-bold text-[#92400e]">
            Hay {ordenesEspera.length} orden(es) esperando cupo en el taller.
          </p>
        </div>
      )}
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <OrdersTable
          title="Ordenes por ingresar o revisar"
          helper="Ordenes que recepcion debe coordinar con clientes y mecanicos."
          orders={receptionOrders}
          actionLabel="Abrir OT"
          onActionClick={() => onNavigate('Ordenes')}
        />
        <div className="grid gap-[18px]">
          <ActionPanel
            actions={roleConfig.Recepcionista.actions}
            onAction={(action) => {
              if (action === 'Registrar cliente') onNavigate('Clientes');
              else if (action === 'Registrar vehiculo') onNavigate('Vehiculos');
              else if (action === 'Abrir OT') onNavigate('Ordenes');
              else if (action === 'Registrar pago') onNavigate('Pagos');
              else if (action === 'Ver lista de espera') onNavigate('Lista de Espera');
            }}
          />
        </div>
      </section>
    </>
  );
}

export function ReceptionView({
  activeSection,
  cargandoClientes,
  clientes,
  errorClientes,
  guardandoCliente,
  guardandoPago,
  guardandoOrden,
  inventario,
  mensajeFormulario,
  mensajeOrden,
  mensajePago,
  onCrearCliente,
  onCrearOrden,
  onEntregarOrden,
  onRegistrarPago,
  ordenes,
  onNavigate,
  onActivarOrden,
}: {
  activeSection: string;
  cargandoClientes: boolean;
  clientes: Cliente[];
  errorClientes: string | null;
  guardandoCliente: boolean;
  guardandoPago: boolean;
  guardandoOrden: boolean;
  inventario: InventoryItem[];
  mensajeFormulario: string | null;
  mensajeOrden: string | null;
  mensajePago: string | null;
  onCrearCliente: (cliente: CrearClientePayload) => Promise<boolean>;
  onCrearOrden: (orden: CrearOrdenTrabajoPayload) => Promise<boolean>;
  onEntregarOrden: (ordenId: string) => Promise<void>;
  onRegistrarPago: (pago: RegistrarPagoPayload) => Promise<boolean>;
  ordenes: WorkOrder[];
  onNavigate: (section: string) => void;
  onActivarOrden?: (id: string) => Promise<boolean>;
}) {
  if (activeSection === 'Lista de Espera') {
    const ordenesEspera = ordenes.filter((o) => o.status === 'En espera');
    const esperaOrdenadas = [...ordenesEspera].sort((a, b) => parseInt(a.id.replace('OT-', '')) - parseInt(b.id.replace('OT-', '')));
    
    return (
      <section className="grid grid-cols-1 items-start gap-[18px]">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Flujo de trabajo</span>
              <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Lista de Espera</h2>
              <p className="m-[6px_0_0] text-[14px] text-[#64748b]">Órdenes pendientes por falta de cupo en el taller.</p>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  {['Orden', 'Cliente', 'Vehículo', 'Fecha Ingreso', 'Prioridad', 'Acciones'].map((heading) => (
                    <th className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-left text-[12px] font-extrabold uppercase text-[#516071]" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {esperaOrdenadas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border-b border-[#e5eaf0] p-[13px_10px] text-center text-[14px] text-[#64748b]">
                      No hay órdenes en lista de espera
                    </td>
                  </tr>
                ) : (
                  esperaOrdenadas.map((orden, index) => {
                    const esPrioridad = index < 3;
                    return (
                      <tr key={orden.id} className="hover:bg-slate-50">
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold text-[#111827]">{orden.id}</td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{orden.client}</td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{orden.vehicle}</td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{orden.checkIn}</td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                          {esPrioridad ? (
                            <span className="inline-flex rounded-full bg-[#fef2f2] px-2.5 py-1 text-[12px] font-extrabold text-[#b91c1c]">Prioridad</span>
                          ) : (
                            <span className="text-[#64748b] text-[13px]">Normal</span>
                          )}
                        </td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                          <button
                            onClick={async () => {
                              if (onActivarOrden) await onActivarOrden(orden.id);
                            }}
                            className="rounded bg-[#0f6872] px-3 py-1.5 text-white hover:bg-[#0d5861] font-medium"
                          >
                            Activar Orden
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    );
  }

  if (activeSection === 'Clientes') {
    return (
      <ReceptionPanel
        cargandoClientes={cargandoClientes}
        clientes={clientes}
        errorClientes={errorClientes}
        guardandoCliente={guardandoCliente}
        mensajeFormulario={mensajeFormulario}
        onCrearCliente={onCrearCliente}
      />
    );
  }

  if (activeSection === 'Vehiculos') {
    return <VehiclesPanel clientes={clientes} />;
  }

  if (activeSection === 'Ordenes') {
    return (
      <WorkOrdersPanel
        guardandoOrden={guardandoOrden}
        inventario={inventario}
        mensajeOrden={mensajeOrden}
        onCrearOrden={onCrearOrden}
        ordenes={ordenes}
      />
    );
  }

  if (activeSection === 'Pagos') {
    return (
      <PaymentsPanel
        guardandoPago={guardandoPago}
        mensajePago={mensajePago}
        onEntregarOrden={onEntregarOrden}
        onRegistrarPago={onRegistrarPago}
        ordenes={ordenes}
      />
    );
  }

  return <ReceptionDashboard ordenes={ordenes} onNavigate={onNavigate} />;
}
