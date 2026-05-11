import { useEffect, useState } from 'react';
import { ActionPanel } from './components/ActionPanel';
import { AppLayout } from './components/AppLayout';
import { InventoryPanel } from './components/InventoryPanel';
import { OrdersTable } from './components/OrdersTable';
import { ReceptionPanel } from './components/ReceptionPanel';
import { SummaryCards } from './components/SummaryCards';
import { VehiclesPanel } from './components/VehiclesPanel';
import { WorkOrdersPanel } from './components/WorkOrdersPanel';
import { Panel } from './components/Panel';
import { crearCliente, obtenerClientes, type CrearClientePayload } from './api/clientesApi';
import { crearOrdenTrabajo, obtenerOrdenesTrabajo, type CrearOrdenTrabajoPayload } from './api/ordenesTrabajoApi';
import {
  actualizarStockInventario,
  obtenerAlertasStockBajo,
  obtenerInventario,
  obtenerMovimientosInventario,
  registrarEntradaInventario,
  registrarSalidaInventario,
  type ActualizarStockPayload,
  type RegistrarEntradaPayload,
  type RegistrarSalidaPayload,
} from './api/inventarioApi';
import {
  clientes as clientesMock,
  inventoryItems,
  inventorySummary,
  mechanicSummary,
  receptionSummary,
  roleConfig,
  stockMovements,
  workOrders,
} from './data/mockData';
import type { AlertaStockBajo, Cliente, InventoryItem, RepuestoSolicitado, StockMovement, UserRole, WorkOrder } from './types';

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
        {secondaryAction && (
          <button className="min-h-10 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-3.5 text-[14px] font-bold text-[#1f2937] hover:bg-slate-50 md:w-auto" onClick={onSecondaryAction} type="button">
            {secondaryAction}
          </button>
        )}
        {primaryAction && (
          <button className="min-h-10 w-full rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 text-[14px] font-bold text-white hover:bg-[#0c5943] md:w-auto" onClick={onPrimaryAction} type="button">
            {primaryAction}
          </button>
        )}
      </div>
    </header>
  );
}

function AdminView({ activeSection, ordenes, repuestosSolicitados, clientes, inventario, alertasStockBajo, onNavigate }: { activeSection: string; ordenes: WorkOrder[]; repuestosSolicitados: RepuestoSolicitado[]; clientes: Cliente[]; inventario: InventoryItem[]; alertasStockBajo: AlertaStockBajo[]; onNavigate: (section: string) => void }) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = ordenes.find((o) => o.id === selectedOrderId) || null;
  const repuestosOrden = selectedOrder ? repuestosSolicitados.filter((r) => r.ordenTrabajo === selectedOrder.id) : [];

  if (activeSection === 'Clientes') {
    return (
      <section className="grid grid-cols-1 items-start gap-[18px]">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Directorio</span>
              <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Todos los clientes</h2>
              <p className="m-[6px_0_0] text-[14px] text-[#64748b]">Listado completo de clientes registrados en el sistema.</p>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  {['RUT', 'Nombre', 'Telefono', 'Correo'].map((heading) => (
                    <th className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-left text-[12px] font-extrabold uppercase text-[#516071]" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border-b border-[#e5eaf0] p-[13px_10px] text-center text-[14px] text-[#64748b]">
                      No hay clientes registrados
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => (
                    <tr key={cliente.rut} className="hover:bg-slate-50">
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold text-[#111827]">{cliente.rut}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{cliente.nombre}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{cliente.telefono}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{cliente.correo}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    );
  }

  if (activeSection === 'Inventario') {
    return (
      <section className="grid grid-cols-1 items-start gap-[18px]">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Inventario</span>
              <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Todos los repuestos</h2>
              <p className="m-[6px_0_0] text-[14px] text-[#64748b]">Listado completo de repuestos registrados en el sistema.</p>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  {['Nombre', 'Categoria', 'Stock', 'Minimo'].map((heading) => (
                    <th className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-left text-[12px] font-extrabold uppercase text-[#516071]" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventario.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border-b border-[#e5eaf0] p-[13px_10px] text-center text-[14px] text-[#64748b]">
                      No hay repuestos registrados
                    </td>
                  </tr>
                ) : (
                  inventario.map((item) => (
                    <tr key={item.id || item.name} className="hover:bg-slate-50">
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold text-[#111827]">{item.name}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{item.category}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                        <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[12px] font-extrabold ${item.stock < item.minimum ? 'bg-[#fef2f2] text-[#b91c1c]' : 'bg-[#e8f7ef] text-[#0d6848]'}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{item.minimum}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel>
          <div className="mb-3">
            <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Solicitudes</span>
            <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Repuestos solicitados</h2>
            <p className="m-[6px_0_0] text-[13px] text-[#64748b]">Listado de repuestos solicitados por mecanicos para reparaciones.</p>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  {['Repuesto', 'Cantidad', 'Mecanico', 'Orden de Trabajo', 'Fecha', 'Observaciones'].map((heading) => (
                    <th className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-left text-[12px] font-extrabold uppercase text-[#516071]" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {repuestosSolicitados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border-b border-[#e5eaf0] p-[13px_10px] text-center text-[14px] text-[#64748b]">
                      No hay repuestos solicitados
                    </td>
                  </tr>
                ) : (
                  repuestosSolicitados.map((repuesto) => (
                    <tr key={repuesto.id} className="hover:bg-slate-50">
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold text-[#111827]">{repuesto.nombre}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{repuesto.cantidad}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{repuesto.mecanico}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold">{repuesto.ordenTrabajo}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{repuesto.fecha}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{repuesto.observaciones || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    );
  }

  if (activeSection === 'Ordenes') {
    return (
      <section className="grid grid-cols-1 items-start gap-[18px]">
        <div className="grid gap-[18px]">
          <OrdersTable
            title="Todas las ordenes"
            helper="Haz clic en una fila para ver todos los detalles de la orden."
            orders={ordenes}
            actionLabel=""
            onRowClick={(order) => setSelectedOrderId(order.id === selectedOrderId ? null : order.id)}
            selectedOrderId={selectedOrderId || undefined}
          />
          {selectedOrder && (
            <Panel>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Detalle de Orden</span>
                  <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Orden {selectedOrder.id}</h2>
                </div>
                <span className={`inline-flex w-fit rounded-full px-2.5 py-1.5 text-[12px] font-extrabold ${
                  selectedOrder.status === 'En proceso'
                    ? 'bg-[#e8f7ef] text-[#0d6848]'
                    : selectedOrder.status === 'Finalizada'
                    ? 'bg-[#e5f7f8] text-[#0f6872]'
                    : selectedOrder.status === 'En revision'
                    ? 'bg-[#eaf2ff] text-[#1e55a8]'
                    : 'bg-[#fff7ed] text-[#9a4b00]'
                }`}>{selectedOrder.status}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-[#e5eaf0] bg-[#f8fafc] p-4">
                  <h3 className="mb-2.5 text-[14px] font-extrabold text-[#111827]">Datos Generales</h3>
                  <div className="grid gap-1.5 text-[13px] text-[#475569]">
                    <p className="m-0"><strong>Cliente:</strong> {selectedOrder.client}</p>
                    <p className="m-0"><strong>Vehiculo:</strong> {selectedOrder.vehicle}</p>
                    <p className="m-0"><strong>Mecanico asignado:</strong> {selectedOrder.mechanic || 'Sin asignar'}</p>
                    <p className="m-0"><strong>Tipo de servicio:</strong> {selectedOrder.tipoServicio || 'No especificado'}</p>
                    <p className="m-0 border-t border-[#e5eaf0] pt-1.5 mt-1"><strong>Fecha de Ingreso:</strong> {selectedOrder.checkIn}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-[#e5eaf0] bg-[#f8fafc] p-4">
                  <h3 className="mb-2.5 text-[14px] font-extrabold text-[#111827]">Informacion Tecnica</h3>
                  <div className="grid gap-1.5 text-[13px] text-[#475569]">
                    <p className="m-0"><strong>Año:</strong> {selectedOrder.año || 'No especificado'}</p>
                    <p className="m-0"><strong>Kilometraje:</strong> {selectedOrder.kilometraje ? `${selectedOrder.kilometraje.toLocaleString('es-CL')} km` : 'No especificado'}</p>
                  </div>
                </div>
                <div className="md:col-span-2 rounded-lg border border-[#e5eaf0] bg-[#f8fafc] p-4">
                  <h3 className="mb-1.5 text-[14px] font-extrabold text-[#111827]">Diagnostico Inicial</h3>
                  <p className="m-0 text-[13px] text-[#475569] whitespace-pre-wrap">{selectedOrder.diagnosticoInicial || 'Sin diagnostico inicial registrado.'}</p>
                </div>
                {repuestosOrden.length > 0 && (
                  <div className="md:col-span-2 rounded-lg border border-[#e5eaf0] bg-[#f8fafc] p-4">
                    <h3 className="mb-2.5 text-[14px] font-extrabold text-[#111827]">Repuestos Solicitados</h3>
                    <ul className="m-0 grid gap-2 pl-4 text-[13px] text-[#475569]">
                      {repuestosOrden.map((repuesto) => (
                        <li key={repuesto.id}>
                          <strong>{repuesto.cantidad}x {repuesto.nombre}</strong>
                          {repuesto.observaciones ? ` - ${repuesto.observaciones}` : ''}
                          <span className="text-[#64748b]"> (Solicitado el {repuesto.fecha})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Panel>
          )}
        </div>
      </section>
    );
  }

  const activasCount = ordenes.filter((o) => !['Finalizada', 'Entregada', 'Cancelada'].includes(o.status)).length;
  const revisionCount = ordenes.filter((o) => o.status === 'En revision').length;
  const stockBajoCount = alertasStockBajo.length || inventario.filter((i) => i.stock < i.minimum).length;

  const dynamicAdminSummary = [
    {
      label: 'Ordenes activas',
      value: activasCount.toString(),
      helper: 'Trabajos abiertos en el taller',
      borderClass: 'border-t-[#0f8a5f]',
    },
    {
      label: 'En revision',
      value: revisionCount.toString(),
      helper: 'Vehiculo esperando diagnostico',
      borderClass: 'border-t-[#d48806]',
    },
    {
      label: 'Stock bajo',
      value: stockBajoCount.toString(),
      helper: 'Repuestos bajo el minimo definido',
      borderClass: 'border-t-[#dc2626]',
    },
  ];

  return (
    <>
      <SummaryCards cards={dynamicAdminSummary} />
      {alertasStockBajo.length > 0 && (
        <div className="mb-[18px] rounded-[8px] border border-[#fecaca] bg-[#fef2f2] p-4">
          <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[12px] font-extrabold uppercase text-[#b91c1c]">Alerta stock bajo</span>
            <button
              className="w-fit rounded-[7px] border border-[#b91c1c] bg-white px-3 py-1.5 text-[13px] font-bold text-[#b91c1c] hover:bg-[#fff7f7]"
              onClick={() => onNavigate('Inventario')}
              type="button"
            >
              Ver inventario
            </button>
          </div>
          <div className="grid gap-1.5">
            {alertasStockBajo.slice(0, 3).map((alerta) => (
              <p className="m-0 text-[14px] font-bold text-[#111827]" key={alerta.repuestoId}>
                {alerta.mensaje}
              </p>
            ))}
            {alertasStockBajo.length > 3 && (
              <p className="m-0 text-[13px] font-bold text-[#7f1d1d]">
                +{alertasStockBajo.length - 3} repuestos adicionales con stock bajo
              </p>
            )}
          </div>
        </div>
      )}
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-[18px]">
          <Panel>
            <div className="mb-4">
              <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Flujo de trabajo</span>
              <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Estado de Ordenes</h2>
              <p className="m-[6px_0_0] text-[14px] text-[#64748b]">Monitor detallado de las ordenes segun su etapa actual.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Pendiente', 'En revision', 'En proceso', 'Finalizada'].map((estado) => {
                const ordenesEstado = ordenes.filter((o) => o.status === estado);
                return (
                  <div key={estado} className="flex flex-col gap-2 rounded-lg border border-[#e5eaf0] bg-[#f8fafc] p-3">
                    <div className="flex items-center justify-between border-b border-[#e5eaf0] pb-2">
                      <strong className="text-[14px] text-[#111827]">{estado}</strong>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[12px] font-bold text-[#64748b] border border-[#e5eaf0]">{ordenesEstado.length}</span>
                    </div>
                    {ordenesEstado.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {ordenesEstado.map(o => (
                          <span key={o.id} className="inline-flex rounded bg-white px-2 py-1 text-[12px] font-bold text-[#0f6b52] border border-[#cbd5e1] shadow-sm">
                            {o.id}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[12px] text-[#64748b] italic">Sin ordenes</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
        <div className="grid gap-[18px]">
          <ActionPanel
            actions={roleConfig.Administrador.actions}
            onAction={(action) => {
              if (action === 'Ver ordenes') onNavigate('Ordenes');
              else if (action === 'Ver inventario') onNavigate('Inventario');
              else if (action === 'Gestionar usuarios') onNavigate('Clientes');
            }}
          />
        </div>
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
    return <WorkOrdersPanel guardandoOrden={guardandoOrden} mensajeOrden={mensajeOrden} onCrearOrden={onCrearOrden} ordenes={ordenes} />;
  }

  return <ReceptionDashboard ordenes={ordenes} onNavigate={onNavigate} />;
}

function MechanicView({
  activeSection,
  ordenes,
  onActualizarEstado,
  onSolicitarRepuesto,
}: {
  activeSection: string;
  ordenes: WorkOrder[];
  onActualizarEstado: (id: string, estado: WorkOrder['status']) => void;
  onSolicitarRepuesto?: (nombre: string, cantidad: number, mecanico: string, ordenTrabajo: string, observaciones?: string) => void;
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
                        const cantidadInput = (document.querySelector('input[type="number"]') as HTMLInputElement);
                        const cantidad = cantidadInput ? parseInt(cantidadInput.value, 10) : 1;
                        onSolicitarRepuesto?.(repuestoSolicitado, cantidad, 'Camila Torres', selectedOrder?.id || '', '');
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
  repuestosSolicitados,
  mensajeInventario,
  formularioInventario,
  onActualizarCampoInventario,
  onActualizarStockInventario,
  onRegistrarEntradaInventario,
  onRegistrarSalidaInventario,
  onIrAMovimientos,
  onIrAStockBajo,
}: {
  activeSection: string;
  cargandoInventario: boolean;
  inventario: InventoryItem[];
  movimientosInventario: StockMovement[];
  repuestosSolicitados: RepuestoSolicitado[];
  mensajeInventario: string | null;
  formularioInventario: InventarioFormulario;
  onActualizarCampoInventario: (campo: keyof InventarioFormulario, valor: string) => void;
  onActualizarStockInventario: () => Promise<void>;
  onRegistrarEntradaInventario: () => Promise<void>;
  onRegistrarSalidaInventario: () => Promise<void>;
  onIrAMovimientos: (target?: 'top' | 'entry' | 'exit' | 'recent') => void;
  onIrAStockBajo: () => void;
}) {
  const soloMovimientos = activeSection === 'Movimientos';
  const esStockBajo = activeSection === 'Stock bajo';
  const esRepuestosSolicitados = activeSection === 'Repuestos solicitados';

  // Nos aseguramos de que el inventario sea un arreglo válido, aunque la API falle o traiga mal formato
  const inventarioSeguro = Array.isArray(inventario) ? inventario : [];
  const itemsAMostrar = esStockBajo
    ? inventarioSeguro.filter((item) => (item?.stock || 0) < (item?.minimum || 0))
    : inventarioSeguro;

  if (esRepuestosSolicitados) {
    return (
      <>
        <SummaryCards cards={inventorySummary} />
        <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <Panel>
            <div className="mb-3">
              <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Inventario</span>
              <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Repuestos solicitados</h2>
              <p className="m-[6px_0_0] text-[13px] text-[#64748b]">Listado de repuestos solicitados por mecanicos para reparaciones.</p>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr>
                    {['Repuesto', 'Cantidad', 'Mecanico', 'Orden de Trabajo', 'Fecha', 'Observaciones'].map((heading) => (
                      <th className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-left text-[12px] font-extrabold uppercase text-[#516071]" key={heading}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {repuestosSolicitados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border-b border-[#e5eaf0] p-[13px_10px] text-center text-[14px] text-[#64748b]">
                        No hay repuestos solicitados
                      </td>
                    </tr>
                  ) : (
                    repuestosSolicitados.map((repuesto) => (
                      <tr key={repuesto.id} className="hover:bg-slate-50">
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold text-[#111827]">{repuesto.nombre}</td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{repuesto.cantidad}</td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{repuesto.mecanico}</td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold">{repuesto.ordenTrabajo}</td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{repuesto.fecha}</td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{repuesto.observaciones || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
          <ActionPanel
            actions={roleConfig.Inventario.actions}
            onAction={(action) => {
              if (action === 'Reponer repuesto') {
                onIrAMovimientos('entry');
              } else if (action === 'Registrar salida') {
                onIrAMovimientos('exit');
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

  return (
    <>
      <SummaryCards cards={inventorySummary} />
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <InventoryPanel
          cargando={cargandoInventario}
          formulario={soloMovimientos ? formularioInventario : undefined}
          items={itemsAMostrar}
          title={esRepuestosSolicitados ? 'Repuestos solicitados' : esStockBajo ? 'Repuestos con stock bajo' : 'Stock de repuestos'}
          mensaje={mensajeInventario}
          movements={movimientosInventario}
          onActualizarCampo={soloMovimientos ? onActualizarCampoInventario : undefined}
          onActualizarStock={soloMovimientos ? onActualizarStockInventario : undefined}
          onRegistrarEntrada={soloMovimientos ? onRegistrarEntradaInventario : undefined}
          onRegistrarSalida={soloMovimientos ? onRegistrarSalidaInventario : undefined}
          showMovements={soloMovimientos}
          showStockList={!soloMovimientos}
        />
        <ActionPanel
          actions={roleConfig.Inventario.actions}
          onAction={(action) => {
            if (action === 'Reponer repuesto') {
              onIrAMovimientos('entry');
            } else if (action === 'Registrar salida') {
              onIrAMovimientos('exit');
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
  alertasStockBajo,
  movimientosInventario,
  mensajeInventario,
  formularioInventario,
  onActualizarCampoInventario,
  onActualizarStockInventario,
  onRegistrarEntradaInventario,
  onRegistrarSalidaInventario,
  onIrAMovimientos,
  onIrAStockBajo,
  ordenesTrabajo,
  repuestosSolicitados,
  onActualizarEstadoOT,
  onSolicitarRepuesto,
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
  alertasStockBajo: AlertaStockBajo[];
  movimientosInventario: StockMovement[];
  mensajeInventario: string | null;
  formularioInventario: InventarioFormulario;
  onActualizarCampoInventario: (campo: keyof InventarioFormulario, valor: string) => void;
  onActualizarStockInventario: () => Promise<void>;
  onRegistrarEntradaInventario: () => Promise<void>;
  onRegistrarSalidaInventario: () => Promise<void>;
  onIrAMovimientos: (target?: 'top' | 'entry' | 'exit' | 'recent') => void;
  onIrAStockBajo: () => void;
  ordenesTrabajo: WorkOrder[];
  repuestosSolicitados: RepuestoSolicitado[];
  onActualizarEstadoOT: (id: string, estado: WorkOrder['status']) => void;
  onSolicitarRepuesto: (nombre: string, cantidad: number, mecanico: string, ordenTrabajo: string, observaciones?: string) => void;
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
    return <MechanicView activeSection={activeSection} ordenes={ordenesTrabajo} onActualizarEstado={onActualizarEstadoOT} onSolicitarRepuesto={onSolicitarRepuesto} />;
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
        repuestosSolicitados={repuestosSolicitados}
        onActualizarCampoInventario={onActualizarCampoInventario}
        onActualizarStockInventario={onActualizarStockInventario}
        onRegistrarEntradaInventario={onRegistrarEntradaInventario}
        onRegistrarSalidaInventario={onRegistrarSalidaInventario}
        onIrAMovimientos={onIrAMovimientos}
        onIrAStockBajo={onIrAStockBajo}
      />
    );
  }

  return <AdminView activeSection={activeSection} ordenes={ordenesTrabajo} repuestosSolicitados={repuestosSolicitados} clientes={clientes} inventario={inventario} alertasStockBajo={alertasStockBajo} onNavigate={onNavigate} />;
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
  const [alertasStockBajo, setAlertasStockBajo] = useState<AlertaStockBajo[]>([]);
  const [movimientosInventario, setMovimientosInventario] = useState<StockMovement[]>(stockMovements);
  const [repuestosSolicitados, setRepuestosSolicitados] = useState<RepuestoSolicitado[]>([]);
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
        const [inventarioDesdeApi, movimientosDesdeApi, alertasDesdeApi] = await Promise.all([
          obtenerInventario(),
          obtenerMovimientosInventario(),
          obtenerAlertasStockBajo(),
        ]);

        setInventario(inventarioDesdeApi);
        setMovimientosInventario(movimientosDesdeApi);
        setAlertasStockBajo(alertasDesdeApi);
      } catch {
        setInventario(inventoryItems);
        setMovimientosInventario(stockMovements);
        setAlertasStockBajo([]);
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
    const [inventarioDesdeApi, movimientosDesdeApi, alertasDesdeApi] = await Promise.all([
      obtenerInventario(),
      obtenerMovimientosInventario(),
      obtenerAlertasStockBajo(),
    ]);

    setInventario(inventarioDesdeApi);
    setMovimientosInventario(movimientosDesdeApi);
    setAlertasStockBajo(alertasDesdeApi);
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

  async function handleRegistrarSalidaInventario() {
    const nombre = formularioInventario.nombre.trim();
    const cantidad = Number(formularioInventario.cantidad);

    if (!nombre) {
      setMensajeInventario('Selecciona el repuesto a descontar');
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      setMensajeInventario('La salida debe ser un numero mayor a 0');
      return;
    }

    const payload: RegistrarSalidaPayload = {
      nombre,
      cantidad,
      nota: formularioInventario.nota.trim() || undefined,
    };

    setCargandoInventario(true);
    setMensajeInventario(null);

    try {
      await registrarSalidaInventario(payload);
      await recargarInventario();
      setMensajeInventario('Salida registrada correctamente');
      setFormularioInventario(formularioInventarioInicial);
    } catch (error) {
      setMensajeInventario(error instanceof Error ? error.message : 'No se pudo registrar la salida');
    } finally {
      setCargandoInventario(false);
    }
  }

  // Navega a la sección Movimientos y opcionalmente hace scroll al objetivo
  function handleIrAMovimientos(target?: 'top' | 'entry' | 'exit' | 'recent') {
    setActiveSection('Movimientos');
    // esperar al render
    setTimeout(() => {
      let id = 'update-stock-top';
      if (target === 'entry') id = 'register-entry';
      if (target === 'exit') id = 'register-output';
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
    if (activeRole === 'Administrador') {
      setActiveSection('Ordenes');
    }
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

  function handleSolicitarRepuesto(nombre: string, cantidad: number, mecanico: string, ordenTrabajo: string, observaciones?: string) {
    const nuevoRepuesto: RepuestoSolicitado = {
      id: `REQ-${Date.now()}`,
      nombre,
      cantidad,
      mecanico,
      ordenTrabajo,
      observaciones,
      fecha: new Date().toISOString().split('T')[0],
    };
    setRepuestosSolicitados((actuales) => [...actuales, nuevoRepuesto]);
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
        alertasStockBajo={alertasStockBajo}
        mensajeInventario={mensajeInventario}
        movimientosInventario={movimientosInventario}
        onActualizarCampoInventario={actualizarCampoInventario}
        onActualizarStockInventario={handleActualizarStockInventario}
        onRegistrarEntradaInventario={handleRegistrarEntradaInventario}
        onRegistrarSalidaInventario={handleRegistrarSalidaInventario}
        onIrAMovimientos={handleIrAMovimientos}
        onIrAStockBajo={handleIrAStockBajo}
        ordenesTrabajo={ordenesTrabajo}
        repuestosSolicitados={repuestosSolicitados}
        onActualizarEstadoOT={handleActualizarEstadoOT}
        onSolicitarRepuesto={handleSolicitarRepuesto}
        onNavigate={setActiveSection}
        role={activeRole}
      />
    </AppLayout>
  );
}

export default App;
