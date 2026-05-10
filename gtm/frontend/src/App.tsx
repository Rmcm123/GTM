import { useEffect, useState } from 'react';
import { ActionPanel } from './components/ActionPanel';
import { AppLayout } from './components/AppLayout';
import { CapacityPanel } from './components/CapacityPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { OrdersTable } from './components/OrdersTable';
import { ReceptionPanel } from './components/ReceptionPanel';
import { SummaryCards } from './components/SummaryCards';
import { VehiclesPanel } from './components/VehiclesPanel';
import { WorkOrdersPanel } from './components/WorkOrdersPanel';
import { WorkflowPanel } from './components/WorkflowPanel';
import { Panel } from './components/Panel';
import { crearCliente, obtenerClientes, type CrearClientePayload } from './api/clientesApi';
import { crearOrdenTrabajo, obtenerOrdenesTrabajo, type CrearOrdenTrabajoPayload } from './api/ordenesTrabajoApi';
import {
  actualizarStockInventario,
  obtenerInventario,
  obtenerMovimientosInventario,
  registrarEntradaInventario,
  type ActualizarStockPayload,
  type RegistrarEntradaPayload,
} from './api/inventarioApi';
import {
  adminSummary,
  clientes as clientesMock,
  inventoryItems,
  inventorySummary,
  mechanicSummary,
  receptionSummary,
  roleConfig,
  stockMovements,
  workOrders,
  workflow,
} from './data/mockData';
import type { Cliente, InventoryItem, StockMovement, UserRole, WorkOrder } from './types';

type InventarioFormulario = {
  nombre: string;
  categoria: string;
  minimo: string;
  stock: string;
  cantidad: string;
  nota: string;
};

const formularioInventarioInicial: InventarioFormulario = {
  nombre: '',
  categoria: '',
  minimo: '',
  stock: '',
  cantidad: '',
  nota: '',
};

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

function AdminView({ ordenes }: { ordenes: WorkOrder[] }) {
  return (
    <>
      <SummaryCards cards={adminSummary} />
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <OrdersTable title="Ordenes activas" helper="Todas las ordenes visibles para control general." orders={ordenes} />
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

function ReceptionDashboard({ ordenes, onNavigate }: { ordenes: WorkOrder[]; onNavigate: (section: string) => void }) {
  const receptionOrders = ordenes.filter((order) => order.status === 'Pendiente' || order.status === 'En revision');

  return (
    <>
      <SummaryCards cards={receptionSummary} />
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <OrdersTable title="Ordenes por ingresar o revisar" helper="Ordenes que recepcion debe coordinar con clientes y mecanicos." orders={receptionOrders} actionLabel="Abrir OT" />
        <div className="grid gap-[18px]">
          <CapacityPanel occupiedSlots={3} totalSlots={5} />
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

function ReceptionView({
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
    return <WorkOrdersPanel clientes={clientes} guardandoOrden={guardandoOrden} mensajeOrden={mensajeOrden} onCrearOrden={onCrearOrden} ordenes={ordenes} />;
  }

  return <ReceptionDashboard ordenes={ordenes} onNavigate={onNavigate} />;
}

function MechanicView({
  activeSection,
  ordenes,
  onActualizarEstado,
}: {
  activeSection: string;
  ordenes: WorkOrder[];
  onActualizarEstado: (id: string, estado: WorkOrder['status']) => void;
}) {
  const mechanicOrders = ordenes.filter((order) => order.mechanic === 'Camila Torres');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = mechanicOrders.find((o) => o.id === selectedOrderId) || null;
  const [mostrarPista, setMostrarPista] = useState(false);
  const [mensajeDetalle, setMensajeDetalle] = useState<string | null>(null);
  const [mostrarModalRepuesto, setMostrarModalRepuesto] = useState(false);
  const [repuestoSolicitado, setRepuestoSolicitado] = useState('');
  const [mensajeAccion, setMensajeAccion] = useState<string | null>(null);

  function handleAccionBotonesMecanico(accion: string) {
    if (!selectedOrder) {
      setMensajeAccion('Debes seleccionar una orden de trabajo primero.');
      setTimeout(() => setMensajeAccion(null), 3000);
      return;
    }

    switch (accion) {
      case 'Iniciar revision':
        onActualizarEstado(selectedOrder.id, 'En revision');
        setMensajeAccion('Revisión iniciada correctamente.');
        break;
      case 'Pasar a proceso':
        if (selectedOrder.status !== 'En revision') {
          setMensajeAccion('Debes estar en revisión para pasar a proceso.');
          setTimeout(() => setMensajeAccion(null), 3000);
          return;
        }
        onActualizarEstado(selectedOrder.id, 'En proceso');
        setMensajeAccion('Orden pasada a proceso.');
        break;
      case 'Finalizar OT':
        onActualizarEstado(selectedOrder.id, 'Finalizada');
        setMensajeAccion('Orden finalizada correctamente.');
        break;
      case 'Solicitar repuesto':
        setMostrarModalRepuesto(true);
        break;
    }
    setTimeout(() => setMensajeAccion(null), 3000);
  }

  if (activeSection === 'Vehiculos') {
    return (
      <section className="grid grid-cols-1 gap-[18px]">
        <Panel>
          <div className="mb-4">
            <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Flota asignada</span>
            <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Detalles Tecnicos de Vehiculos</h2>
            <p className="m-[6px_0_0] text-[14px] text-[#64748b]">Completa las especificaciones tecnicas de los vehiculos en tus ordenes de trabajo.</p>
          </div>
          <div className="grid gap-6">
            {mechanicOrders.map((order) => (
              <div className="rounded-lg border border-[#e5eaf0] bg-[#f8fafc] p-4" key={order.id}>
                <div className="mb-4 flex flex-col gap-2 border-b border-[#e5eaf0] pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <strong className="block text-[16px] text-[#111827]">{order.vehicle}</strong>
                    <span className="text-[13px] text-[#64748b]">OT: {order.id} · Cliente: {order.client} · Ingreso: {order.checkIn}</span>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-[#e8f7ef] px-2.5 py-1.5 text-[12px] font-extrabold text-[#0d6848]">
                    Año: 2018 (aprox) · 55.000 km
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                    Tipo de motor
                    <input className="min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]" placeholder="Ej: 2.0L 4 cilindros" type="text" />
                  </label>
                  <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                    Transmision
                    <input className="min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]" placeholder="Ej: Automatica 6 vel" type="text" />
                  </label>
                  <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                    Traccion
                    <input className="min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]" placeholder="Ej: 4x4 / FWD" type="text" />
                  </label>
                  <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                    Numero de chasis (VIN)
                    <input className="min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]" placeholder="17 caracteres" type="text" />
                  </label>
                  <label className="grid gap-1.5 text-[13px] font-bold text-[#475569] md:col-span-2">
                    Observaciones tecnicas
                    <input className="min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]" placeholder="Detalles de filtros, fluidos u otras especificaciones..." type="text" />
                  </label>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    className="min-h-9 rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 text-[13px] font-bold text-white hover:bg-[#0c5943]"
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      const original = btn.innerText;
                      btn.innerText = 'Guardado \u2713';
                      setTimeout(() => {
                        btn.innerText = original;
                      }, 2000);
                    }}
                    type="button"
                  >
                    Guardar detalles tecnicos
                  </button>
                </div>
              </div>
            ))}
            {mechanicOrders.length === 0 && (
              <p className="text-[14px] text-[#64748b]">No hay vehiculos asignados a tu carga de trabajo actual.</p>
            )}
          </div>
        </Panel>
      </section>
    );
  }

  return (
    <>
      <SummaryCards cards={mechanicSummary} />
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-[18px]">
          <OrdersTable
            title="Mis ordenes asignadas"
            helper="Trabajos que el mecanico debe revisar o actualizar."
            orders={mechanicOrders}
            actionLabel="Ver detalle"
            onActionClick={() => {
              if (!selectedOrder) setMostrarPista(true);
            }}
            onRowClick={(order) => {
              setSelectedOrderId(order.id);
              setMostrarPista(false);
              setMensajeDetalle(null);
            }}
            selectedOrderId={selectedOrderId || undefined}
          />

          {mostrarPista && !selectedOrder && (
            <div className="rounded-[7px] bg-[#eef4f2] p-3 text-[14px] font-bold text-[#0f6b52]">
              Haz clic en una fila de la tabla para seleccionar una Orden de Trabajo (OT) y ver sus detalles.
            </div>
          )}

          {selectedOrder && (
            <Panel>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Detalle de Orden</span>
                  <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Orden {selectedOrder.id}</h2>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <label className="text-[11px] font-bold uppercase text-[#64748b]">Cambiar estado</label>
                  <div className="relative inline-flex items-center">
                    <select
                      className={`appearance-none rounded-full border border-transparent pl-3 pr-8 py-1.5 text-[12px] font-extrabold outline-none cursor-pointer hover:opacity-80 focus:border-[#cbd5e1] ${
                        selectedOrder.status === 'En proceso'
                          ? 'bg-[#e8f7ef] text-[#0d6848]'
                          : selectedOrder.status === 'Finalizada'
                          ? 'bg-[#e5f7f8] text-[#0f6872]'
                          : selectedOrder.status === 'En revision'
                          ? 'bg-[#eaf2ff] text-[#1e55a8]'
                          : 'bg-[#fff7ed] text-[#9a4b00]'
                      }`}
                      value={selectedOrder.status}
                      onChange={(e) => onActualizarEstado(selectedOrder.id, e.target.value as WorkOrder['status'])}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En revision">En revision</option>
                      <option value="En proceso">En proceso</option>
                      <option value="Finalizada">Finalizada</option>
                    </select>
                    <svg
                      className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 opacity-60"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-[#e5eaf0] bg-[#f8fafc] p-4">
                  <h3 className="mb-2.5 text-[14px] font-extrabold text-[#111827]">Caracteristicas del Vehiculo</h3>
                  <div className="grid gap-1.5 text-[13px] text-[#475569]">
                    <p className="m-0"><strong>Vehiculo:</strong> {selectedOrder.vehicle}</p>
                    <p className="m-0"><strong>Cliente:</strong> {selectedOrder.client}</p>
                    <p className="m-0"><strong>Ingreso:</strong> {selectedOrder.checkIn}</p>
                    <p className="m-0 mt-1 border-t border-[#e5eaf0] pt-1.5"><strong>Año:</strong> {selectedOrder.año || 'No especificado'}</p>
                    <p className="m-0"><strong>Kilometraje:</strong> {selectedOrder.kilometraje ? `${selectedOrder.kilometraje.toLocaleString('es-CL')} km` : 'No especificado'}</p>
                  </div>
                </div>
              <div className="flex flex-col gap-3 rounded-lg border border-[#e5eaf0] bg-[#f8fafc] p-4" key={selectedOrder.id}>
                <div>
                  <h3 className="mb-1.5 text-[14px] font-extrabold text-[#111827]">Motivo de Ingreso / Diagnostico</h3>
                  <textarea
                    className="min-h-[80px] w-full rounded-[7px] border border-[#cbd5e1] bg-[#f8fafc] px-3 py-2 text-[13px] text-[#111827] outline-none cursor-default"
                    placeholder="Diagnostico no disponible"
                    value={selectedOrder.diagnosticoInicial || ''}
                    readOnly
                  />
                </div>
                <div>
                  <h4 className="mb-1.5 text-[13px] font-extrabold text-[#111827]">Trabajos a realizar</h4>
                  <textarea
                    className="min-h-[80px] w-full rounded-[7px] border border-[#cbd5e1] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#0f6b52]"
                    placeholder="Describe los trabajos exactos a realizar (ej: Cambio de aceite, revision de frenos)..."
                  />
                </div>
                {mensajeDetalle && <p className="m-0 rounded-[7px] bg-[#eef4f2] p-2.5 text-[13px] font-bold text-[#0f6b52]">{mensajeDetalle}</p>}
                <div className="mt-1 flex justify-end">
                  <button
                    className="rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 py-2 text-[13px] font-bold text-white hover:bg-[#0c5943]"
                    onClick={() => setMensajeDetalle('Detalles guardados correctamente.')}
                    type="button"
                  >
                    Guardar detalles
                  </button>
                </div>
                </div>
              </div>
            </Panel>
          )}
        </div>
        <div className="grid gap-[18px]">
          {mensajeAccion && (
            <div className="rounded-[7px] bg-[#eef4f2] p-3 text-[14px] font-bold text-[#0f6b52]">
              {mensajeAccion}
            </div>
          )}
          <ActionPanel actions={roleConfig.Mecanico.actions} onAction={handleAccionBotonesMecanico} />
          {mostrarModalRepuesto && (
            <Panel className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-full max-w-md rounded-[7px] border border-[#e5eaf0] bg-white p-6">
                <h3 className="mb-4 text-[18px] font-extrabold text-[#111827]">Solicitar Repuesto</h3>
                <p className="mb-4 text-[14px] text-[#64748b]">Orden: {selectedOrder?.id}</p>
                <div className="mb-4 grid gap-3">
                  <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                    Nombre del repuesto
                    <input
                      className="min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]"
                      placeholder="Ej: Pastilla de freno, filtro de aire"
                      type="text"
                      value={repuestoSolicitado}
                      onChange={(e) => setRepuestoSolicitado(e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                    Cantidad
                    <input
                      className="min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]"
                      placeholder="Cantidad necesaria"
                      type="number"
                      min="1"
                    />
                  </label>
                  <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                    Observaciones
                    <textarea
                      className="min-h-[80px] w-full rounded-[7px] border border-[#cbd5e1] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#0f6b52]"
                      placeholder="Detalles adicionales sobre el repuesto..."
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    className="rounded-[7px] border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2 text-[14px] font-bold text-[#1f2937] hover:bg-[#eef4f2]"
                    onClick={() => {
                      setMostrarModalRepuesto(false);
                      setRepuestoSolicitado('');
                    }}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className="rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 py-2 text-[14px] font-bold text-white hover:bg-[#0c5943]"
                    onClick={() => {
                      setMensajeAccion(`Repuesto "${repuestoSolicitado}" solicitado correctamente.`);
                      setMostrarModalRepuesto(false);
                      setRepuestoSolicitado('');
                      setTimeout(() => setMensajeAccion(null), 3000);
                    }}
                    type="button"
                  >
                    Solicitar
                  </button>
                </div>
              </div>
            </Panel>
          )}
        </div>
      </section>
    </>
  );
}

function InventoryView({
  activeSection,
  cargandoInventario,
  inventario,
  movimientosInventario,
  mensajeInventario,
  formularioInventario,
  onActualizarCampoInventario,
  onActualizarStockInventario,
  onRegistrarEntradaInventario,
  onIrAMovimientos,
  onIrAStockBajo,
}: {
  activeSection: string;
  cargandoInventario: boolean;
  inventario: InventoryItem[];
  movimientosInventario: StockMovement[];
  mensajeInventario: string | null;
  formularioInventario: InventarioFormulario;
  onActualizarCampoInventario: (campo: keyof InventarioFormulario, valor: string) => void;
  onActualizarStockInventario: () => Promise<void>;
  onRegistrarEntradaInventario: () => Promise<void>;
  onIrAMovimientos: (target?: 'top' | 'entry' | 'recent') => void;
  onIrAStockBajo: () => void;
}) {
  const soloMovimientos = activeSection === 'Movimientos';
  const esStockBajo = activeSection === 'Stock bajo';

  // Nos aseguramos de que el inventario sea un arreglo válido, aunque la API falle o traiga mal formato
  const inventarioSeguro = Array.isArray(inventario) ? inventario : [];
  const itemsAMostrar = esStockBajo
    ? inventarioSeguro.filter((item) => (item?.stock || 0) < (item?.minimum || 0))
    : inventarioSeguro;

  return (
    <>
      <SummaryCards cards={inventorySummary} />
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <InventoryPanel
          cargando={cargandoInventario}
          formulario={soloMovimientos ? formularioInventario : undefined}
          items={itemsAMostrar}
          title={esStockBajo ? 'Repuestos con stock bajo' : 'Stock de repuestos'}
          mensaje={mensajeInventario}
          movements={movimientosInventario}
          onActualizarCampo={soloMovimientos ? onActualizarCampoInventario : undefined}
          onActualizarStock={soloMovimientos ? onActualizarStockInventario : undefined}
          onRegistrarEntrada={soloMovimientos ? onRegistrarEntradaInventario : undefined}
          showMovements={soloMovimientos}
          showStockList={!soloMovimientos}
        />
        <ActionPanel
          actions={roleConfig.Inventario.actions}
          onAction={(action) => {
            if (action === 'Reponer repuesto') {
              onIrAMovimientos('entry');
            } else if (action === 'Registrar salida') {
              onIrAMovimientos('recent');
            } else if (action === 'Revisar stock bajo') {
              onIrAStockBajo();
            } else if (action === 'Crear repuesto') {
              onIrAMovimientos('top');
            }
          }}
        />
      </section>
    </>
  );
}

function RoleDashboard({
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
  cargandoInventario,
  inventario,
  movimientosInventario,
  mensajeInventario,
  formularioInventario,
  onActualizarCampoInventario,
  onActualizarStockInventario,
  onRegistrarEntradaInventario,
  onIrAMovimientos,
  onIrAStockBajo,
  ordenesTrabajo,
  onActualizarEstadoOT,
  onNavigate,
  role,
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
  cargandoInventario: boolean;
  inventario: InventoryItem[];
  movimientosInventario: StockMovement[];
  mensajeInventario: string | null;
  formularioInventario: InventarioFormulario;
  onActualizarCampoInventario: (campo: keyof InventarioFormulario, valor: string) => void;
  onActualizarStockInventario: () => Promise<void>;
  onRegistrarEntradaInventario: () => Promise<void>;
  onIrAMovimientos: (target?: 'top' | 'entry' | 'recent') => void;
  onIrAStockBajo: () => void;
  ordenesTrabajo: WorkOrder[];
  onActualizarEstadoOT: (id: string, estado: WorkOrder['status']) => void;
  onNavigate: (section: string) => void;
  role: UserRole;
}) {
  if (role === 'Recepcionista') {
    return (
      <ReceptionView
        activeSection={activeSection}
        cargandoClientes={cargandoClientes}
        clientes={clientes}
        errorClientes={errorClientes}
        guardandoCliente={guardandoCliente}
        guardandoOrden={guardandoOrden}
        mensajeFormulario={mensajeFormulario}
        mensajeOrden={mensajeOrden}
        onCrearCliente={onCrearCliente}
        onCrearOrden={onCrearOrden}
        ordenes={ordenes}
        onNavigate={onNavigate}
      />
    );
  }

  if (role === 'Mecanico') {
    return <MechanicView activeSection={activeSection} ordenes={ordenesTrabajo} onActualizarEstado={onActualizarEstadoOT} />;
  }

  if (role === 'Inventario') {
    return (
      <InventoryView
        activeSection={activeSection}
        cargandoInventario={cargandoInventario}
        formularioInventario={formularioInventario}
        inventario={inventario}
        mensajeInventario={mensajeInventario}
        movimientosInventario={movimientosInventario}
        onActualizarCampoInventario={onActualizarCampoInventario}
        onActualizarStockInventario={onActualizarStockInventario}
        onRegistrarEntradaInventario={onRegistrarEntradaInventario}
        onIrAMovimientos={onIrAMovimientos}
        onIrAStockBajo={onIrAStockBajo}
      />
    );
  }

  return <AdminView ordenes={ordenesTrabajo} />;
}

function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('Administrador');
  const currentRole = roleConfig[activeRole];
  const navItemsFiltrados = currentRole.navItems.filter((item) => !(activeRole === 'Mecanico' && (item === 'Estados' || item === 'Estado')));
  const [activeSection, setActiveSection] = useState(navItemsFiltrados[0]);
  const [clientes, setClientes] = useState<Cliente[]>(clientesMock);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [errorClientes, setErrorClientes] = useState<string | null>(null);
  const [guardandoCliente, setGuardandoCliente] = useState(false);
  const [guardandoOrden, setGuardandoOrden] = useState(false);
  const [mensajeFormulario, setMensajeFormulario] = useState<string | null>(null);
  const [ordenesTrabajo, setOrdenesTrabajo] = useState<WorkOrder[]>([]);
  const [mensajeOrden, setMensajeOrden] = useState<string | null>(null);
  const [ordenes, setOrdenes] = useState<WorkOrder[]>([]);
  const [inventario, setInventario] = useState<InventoryItem[]>(inventoryItems);
  const [movimientosInventario, setMovimientosInventario] = useState<StockMovement[]>(stockMovements);
  const [cargandoInventario, setCargandoInventario] = useState(false);
  const [mensajeInventario, setMensajeInventario] = useState<string | null>(null);
  const [formularioInventario, setFormularioInventario] = useState<InventarioFormulario>(formularioInventarioInicial);

  useEffect(() => {
    async function cargarClientes() {
      setCargandoClientes(true);
      setErrorClientes(null);

      try {
        const clientesDesdeApi = await obtenerClientes();
        setClientes(clientesDesdeApi);
      } catch {
        // Si el backend no esta levantado, la pantalla sigue siendo usable con datos locales.
        setClientes(clientesMock);
        setErrorClientes('Mostrando datos locales');
      } finally {
        setCargandoClientes(false);
      }
    }

    void cargarClientes();
  }, []);

  useEffect(() => {
    async function cargarOrdenes() {
      try {
        const ordenesDesdeApi = await obtenerOrdenesTrabajo();
        setOrdenes(ordenesDesdeApi);
        setOrdenesTrabajo(ordenesDesdeApi);
      } catch {
        setOrdenes(workOrders);
        setOrdenesTrabajo(workOrders);
      }
    }

    void cargarOrdenes();
  }, []);

  useEffect(() => {
    async function cargarInventario() {
      setCargandoInventario(true);

      try {
        const [inventarioDesdeApi, movimientosDesdeApi] = await Promise.all([
          obtenerInventario(),
          obtenerMovimientosInventario(),
        ]);

        setInventario(inventarioDesdeApi);
        setMovimientosInventario(movimientosDesdeApi);
      } catch {
        setInventario(inventoryItems);
        setMovimientosInventario(stockMovements);
        setMensajeInventario('Mostrando datos locales de inventario');
      } finally {
        setCargandoInventario(false);
      }
    }

    void cargarInventario();
  }, []);

  async function recargarClientes() {
    const clientesDesdeApi = await obtenerClientes();
    setClientes(clientesDesdeApi);
    setErrorClientes(null);
  }

  async function handleCrearCliente(cliente: CrearClientePayload) {
    setGuardandoCliente(true);
    setMensajeFormulario(null);

    try {
      await crearCliente(cliente);
      // Se vuelve a consultar la API para que la lista refleje exactamente lo guardado en PostgreSQL.
      await recargarClientes();
      setMensajeFormulario('Cliente registrado correctamente');
      return true;
    } catch (error) {
      setMensajeFormulario(error instanceof Error ? error.message : 'No se pudo registrar el cliente');
      return false;
    } finally {
      setGuardandoCliente(false);
    }
  }

  async function recargarOrdenes() {
    const ordenesDesdeApi = await obtenerOrdenesTrabajo();
    setOrdenes(ordenesDesdeApi);
    setOrdenesTrabajo(ordenesDesdeApi);
  }

  async function handleCrearOrden(orden: CrearOrdenTrabajoPayload) {
    setGuardandoOrden(true);
    setMensajeOrden(null);

    try {
      await crearOrdenTrabajo(orden);
      await recargarOrdenes();
      setMensajeOrden('Orden de trabajo creada correctamente');
      return true;
    } catch (error) {
      setMensajeOrden(error instanceof Error ? error.message : 'No se pudo crear la orden de trabajo');
      return false;
    } finally {
      setGuardandoOrden(false);
    }
  }

  function actualizarCampoInventario(campo: keyof InventarioFormulario, valor: string) {
    setFormularioInventario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function validarFormularioInventario(): ActualizarStockPayload | null {
    const nombre = formularioInventario.nombre.trim();

    if (!nombre) {
      setMensajeInventario('Ingresa el nombre del repuesto');
      return null;
    }

    const stock = formularioInventario.stock.trim().length > 0 ? Number(formularioInventario.stock) : 0;
    const minimo = formularioInventario.minimo.trim().length > 0 ? Number(formularioInventario.minimo) : undefined;

    if (!Number.isInteger(stock) || stock < 0) {
      setMensajeInventario('El stock nuevo debe ser un numero mayor o igual a 0');
      return null;
    }

    if (typeof minimo === 'number' && (!Number.isInteger(minimo) || minimo < 0)) {
      setMensajeInventario('El minimo debe ser un numero mayor o igual a 0');
      return null;
    }

    return {
      nombre,
      categoria: formularioInventario.categoria.trim() || undefined,
      minimo,
      stock,
      nota: formularioInventario.nota.trim() || undefined,
    };
  }

  async function recargarInventario() {
    const [inventarioDesdeApi, movimientosDesdeApi] = await Promise.all([
      obtenerInventario(),
      obtenerMovimientosInventario(),
    ]);

    setInventario(inventarioDesdeApi);
    setMovimientosInventario(movimientosDesdeApi);
  }

  async function handleActualizarStockInventario() {
    const payload = validarFormularioInventario();

    if (!payload) {
      return;
    }

    setCargandoInventario(true);
    setMensajeInventario(null);

    try {
      await actualizarStockInventario(payload);
      await recargarInventario();
      setMensajeInventario('Repuesto creado correctamente');
      setFormularioInventario(formularioInventarioInicial);
    } catch (error) {
      setMensajeInventario(error instanceof Error ? error.message : 'No se pudo actualizar el stock');
    } finally {
      setCargandoInventario(false);
    }
  }

  async function handleRegistrarEntradaInventario() {
    const nombre = formularioInventario.nombre.trim();
    const cantidad = Number(formularioInventario.cantidad);
    const minimo = formularioInventario.minimo.trim().length > 0 ? Number(formularioInventario.minimo) : undefined;

    if (!nombre) {
      setMensajeInventario('Ingresa el nombre del repuesto');
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      setMensajeInventario('La entrada debe ser un numero mayor a 0');
      return;
    }

    if (typeof minimo === 'number' && (!Number.isInteger(minimo) || minimo < 0)) {
      setMensajeInventario('El minimo debe ser un numero mayor o igual a 0');
      return;
    }

    const payload: RegistrarEntradaPayload = {
      nombre,
      categoria: formularioInventario.categoria.trim() || undefined,
      minimo,
      cantidad,
      nota: formularioInventario.nota.trim() || undefined,
    };

    setCargandoInventario(true);
    setMensajeInventario(null);

    try {
      await registrarEntradaInventario(payload);
      await recargarInventario();
      setMensajeInventario('Repuesto reponido correctamente');
      setFormularioInventario(formularioInventarioInicial);
    } catch (error) {
      setMensajeInventario(error instanceof Error ? error.message : 'No se pudo registrar la entrada');
    } finally {
      setCargandoInventario(false);
    }
  }

  // Navega a la sección Movimientos y opcionalmente hace scroll al objetivo
  function handleIrAMovimientos(target?: 'top' | 'entry' | 'recent') {
    setActiveSection('Movimientos');
    // esperar al render
    setTimeout(() => {
      let id = 'update-stock-top';
      if (target === 'entry') id = 'register-entry';
      if (target === 'recent') id = 'recent-movements';
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }

  function handleIrAStockBajo() {
    setActiveSection('Stock bajo');
  }

  function handleRoleChange(role: UserRole) {
    setActiveRole(role);
    const navs = roleConfig[role].navItems.filter((item) => !(role === 'Mecanico' && (item === 'Estados' || item === 'Estado')));
    setActiveSection(navs[0]);
  }

  function handlePrimaryAction() {
    if (activeRole === 'Recepcionista') {
      setActiveSection('Ordenes');
    }
    if (activeRole === 'Inventario') {
      handleIrAMovimientos('top');
    }
  }

  function handleSecondaryAction() {
    if (activeRole === 'Recepcionista') {
      setActiveSection('Clientes');
    }

    if (activeRole === 'Inventario') {
      setActiveSection('Movimientos');
    }
  }

  function handleActualizarEstadoOT(id: string, nuevoEstado: WorkOrder['status']) {
    setOrdenesTrabajo((actuales) =>
      actuales.map((ot) => (ot.id === id ? { ...ot, status: nuevoEstado } : ot))
    );
  }

  return (
    <AppLayout
      activeRole={activeRole}
      activeNavItem={activeSection}
      navItems={navItemsFiltrados}
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
      <RoleDashboard
        activeSection={activeSection}
        cargandoClientes={cargandoClientes}
        clientes={clientes}
        errorClientes={errorClientes}
        guardandoCliente={guardandoCliente}
        guardandoOrden={guardandoOrden}
        mensajeFormulario={mensajeFormulario}
        mensajeOrden={mensajeOrden}
        onCrearCliente={handleCrearCliente}
        onCrearOrden={handleCrearOrden}
        ordenes={ordenes}
        cargandoInventario={cargandoInventario}
        formularioInventario={formularioInventario}
        inventario={inventario}
        mensajeInventario={mensajeInventario}
        movimientosInventario={movimientosInventario}
        onActualizarCampoInventario={actualizarCampoInventario}
        onActualizarStockInventario={handleActualizarStockInventario}
        onRegistrarEntradaInventario={handleRegistrarEntradaInventario}
        onIrAMovimientos={handleIrAMovimientos}
        onIrAStockBajo={handleIrAStockBajo}
        ordenesTrabajo={ordenesTrabajo}
        onActualizarEstadoOT={handleActualizarEstadoOT}
        onNavigate={setActiveSection}
        role={activeRole}
      />
    </AppLayout>
  );
}

export default App;
