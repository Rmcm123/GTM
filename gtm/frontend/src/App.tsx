import { useEffect, useState } from 'react';
import { ActionPanel } from './components/ActionPanel';
import { AppLayout } from './components/AppLayout';
import { CapacityPanel } from './components/CapacityPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { OrdersTable } from './components/OrdersTable';
import { ReceptionPanel } from './components/ReceptionPanel';
import { SummaryCards } from './components/SummaryCards';
import { WorkflowPanel } from './components/WorkflowPanel';
import {
  adminSummary,
  customers,
  inventoryItems,
  inventorySummary,
  mechanicSummary,
  receptionSummary,
  roleConfig,
  stockMovements,
  workOrders,
  workflow,
} from './data/mockData';
import type { UserRole, WorkOrder } from './types';

function Header({
  title,
  description,
  secondaryAction,
  primaryAction,
  onPrimaryAction,
  onSecondaryAction,
}: {
  title: string;
  description: string;
  secondaryAction: string;
  primaryAction: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}) {
  return (
    <header className="mb-[22px] flex flex-col items-start justify-between gap-5 md:flex-row">
      <div>
        <span className="mb-1.5 inline-block text-[12px] font-bold uppercase tracking-wide text-[#64748b]">Panel principal</span>
        <h1 className="m-0 text-[26px] font-extrabold leading-[1.15] text-[#111827] md:text-[32px]">{title}</h1>
        <p className="m-[8px_0_0] text-[14px] text-[#64748b]">{description}</p>
      </div>
      <div className="flex w-full flex-col items-center justify-end gap-2.5 md:w-auto md:flex-row">
        <button className="min-h-10 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-3.5 text-[14px] font-bold text-[#1f2937] hover:bg-slate-50 md:w-auto" onClick={onSecondaryAction} type="button">
          {secondaryAction}
        </button>
        <button className="min-h-10 w-full rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 text-[14px] font-bold text-white hover:bg-[#0c5943] md:w-auto" onClick={onPrimaryAction} type="button">
          {primaryAction}
        </button>
      </div>
    </header>
  );
}

function AdminView() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);

  async function fetchOrders() {
    try {
      const res = await fetch('/ot');
      const data = await res.json();
      const mapped: WorkOrder[] = (data || []).map((o: any) => ({
        id: o.id,
        client: o.clienteId || 'N/A',
        vehicle: o.vehiculoId || 'N/A',
        mechanic: o.mecanicoId || 'Sin asignar',
        status: o.estado === 'pendiente' ? 'Pendiente' : o.estado === 'progreso' ? 'En proceso' : 'Finalizada',
        checkIn: new Date(o.creadoEn || o.fechaIngreso).toLocaleString(),
      }));
      setOrders(mapped);
    } catch (e) {
      setOrders([]);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function handleStart(id: string) {
    await fetch(`/ot/${id}/iniciar`, { method: 'POST' });
    fetchOrders();
  }

  async function handleFinish(id: string) {
    await fetch(`/ot/${id}/finalizar`, { method: 'POST' });
    fetchOrders();
  }

  async function handlePay(id: string) {
    const amount = Number(prompt('Monto a pagar') || '0');
    if (!amount || amount <= 0) return;
    await fetch(`/ot/${id}/registrar-pago`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monto: amount }),
    });
    fetchOrders();
  }

  return (
    <>
      <SummaryCards cards={adminSummary} />
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <OrdersTable title="Ordenes activas" helper="Todas las ordenes visibles para control general." orders={orders} onStart={handleStart} onFinish={handleFinish} onPay={handlePay} />
        <div className="grid gap-[18px]">
          <CapacityPanel occupiedSlots={3} totalSlots={5} />
          <WorkflowPanel items={workflow} />
        </div>
      </section>
      <section className="mt-[18px] grid grid-cols-1 gap-[18px] xl:grid-cols-[minmax(280px,1fr)_320px]">
        <InventoryPanel items={inventoryItems} />
        <ActionPanel actions={roleConfig.Administrador.actions} />
      </section>
    </>
  );
}

function ReceptionDashboard() {
  const receptionOrders = workOrders.filter((order) => order.status === 'Pendiente' || order.status === 'En revision');

  return (
    <>
      <SummaryCards cards={receptionSummary} />
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <OrdersTable title="Ordenes por ingresar o revisar" helper="Ordenes que recepcion debe coordinar con clientes y mecanicos." orders={receptionOrders} actionLabel="Abrir OT" />
        <div className="grid gap-[18px]">
          <CapacityPanel occupiedSlots={3} totalSlots={5} />
          <ActionPanel actions={roleConfig.Recepcionista.actions} />
        </div>
      </section>
    </>
  );
}

function ReceptionView({ activeSection }: { activeSection: string }) {
  if (activeSection === 'Clientes') {
    return <ReceptionPanel customers={customers} />;
  }

  return <ReceptionDashboard />;
}

function MechanicView() {
  const mechanicOrders = workOrders.filter((order) => order.mechanic === 'Camila Torres');

  return (
    <>
      <SummaryCards cards={mechanicSummary} />
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <OrdersTable title="Mis ordenes asignadas" helper="Trabajos que el mecanico debe revisar o actualizar." orders={mechanicOrders} actionLabel="Ver detalle" />
        <ActionPanel actions={roleConfig.Mecanico.actions} />
      </section>
    </>
  );
}

function InventoryView() {
  return (
    <>
      <SummaryCards cards={inventorySummary} />
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <InventoryPanel items={inventoryItems} movements={stockMovements} showMovements />
        <ActionPanel actions={roleConfig.Inventario.actions} />
      </section>
    </>
  );
}

function RoleDashboard({ activeSection, role }: { activeSection: string; role: UserRole }) {
  if (role === 'Recepcionista') {
    return <ReceptionView activeSection={activeSection} />;
  }

  if (role === 'Mecanico') {
    return <MechanicView />;
  }

  if (role === 'Inventario') {
    return <InventoryView />;
  }

  return <AdminView />;
}

function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('Administrador');
  const currentRole = roleConfig[activeRole];
  const [activeSection, setActiveSection] = useState(currentRole.navItems[0]);

  function handleRoleChange(role: UserRole) {
    setActiveRole(role);
    setActiveSection(roleConfig[role].navItems[0]);
  }

  function handlePrimaryAction() {
    if (activeRole === 'Recepcionista') {
      setActiveSection('Ordenes');
    }
  }

  function handleSecondaryAction() {
    if (activeRole === 'Recepcionista') {
      setActiveSection('Clientes');
    }
  }

  return (
    <AppLayout
      activeRole={activeRole}
      activeNavItem={activeSection}
      navItems={currentRole.navItems}
      onNavChange={setActiveSection}
      onRoleChange={handleRoleChange}
    >
      <Header
        title={currentRole.title}
        description={currentRole.description}
        secondaryAction={currentRole.secondaryAction}
        primaryAction={currentRole.primaryAction}
        onPrimaryAction={handlePrimaryAction}
        onSecondaryAction={handleSecondaryAction}
      />
      <RoleDashboard activeSection={activeSection} role={activeRole} />
    </AppLayout>
  );
}

export default App;
