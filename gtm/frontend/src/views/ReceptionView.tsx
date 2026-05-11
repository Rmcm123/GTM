import { ActionPanel } from '../components/ActionPanel';
import { OrdersTable } from '../components/OrdersTable';
import { ReceptionPanel } from '../components/ReceptionPanel';
import { SummaryCards } from '../components/SummaryCards';
import { VehiclesPanel } from '../components/VehiclesPanel';
import { WorkOrdersPanel } from '../components/WorkOrdersPanel';
import type { CrearClientePayload } from '../api/clientesApi';
import type { CrearOrdenTrabajoPayload } from '../api/ordenesTrabajoApi';
import { receptionSummary, roleConfig } from '../data/mockData';
import type { Cliente, WorkOrder } from '../types';

export function ReceptionDashboard({ ordenes, onNavigate }: { ordenes: WorkOrder[]; onNavigate: (section: string) => void }) {
  const receptionOrders = ordenes.filter((order) => order.status === 'Pendiente' || order.status === 'En revision');

  return (
    <>
      <SummaryCards cards={receptionSummary} />
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
  guardandoOrden,
  mensajeFormulario,
  mensajeOrden,
  onCrearCliente,
  onCrearOrden,
  ordenes,
  onNavigate,
}: {
  activeSection: string;
  cargandoClientes: boolean;
  clientes: Cliente[];
  errorClientes: string | null;
  guardandoCliente: boolean;
  guardandoOrden: boolean;
  mensajeFormulario: string | null;
  mensajeOrden: string | null;
  onCrearCliente: (cliente: CrearClientePayload) => Promise<boolean>;
  onCrearOrden: (orden: CrearOrdenTrabajoPayload) => Promise<boolean>;
  ordenes: WorkOrder[];
  onNavigate: (section: string) => void;
}) {
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
    return <WorkOrdersPanel guardandoOrden={guardandoOrden} mensajeOrden={mensajeOrden} onCrearOrden={onCrearOrden} ordenes={ordenes} />;
  }

  return <ReceptionDashboard ordenes={ordenes} onNavigate={onNavigate} />;
}
