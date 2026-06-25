import { useState } from 'react';
import { ActionPanel } from '../components/ActionPanel';
import { OrdersTable } from '../components/OrdersTable';
import { Panel } from '../components/Panel';
import { SummaryCards } from '../components/SummaryCards';
import { mechanicSummary, roleConfig } from '../data/mockData';
import type { WorkOrder } from '../types';

export function MechanicView({
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
  const ordenesActivas = mechanicOrders.filter((order) => order.status !== 'Finalizada');
  const ordenesFinalizadas = mechanicOrders.filter((order) => order.status === 'Finalizada');
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
            title="Mis ordenes activas"
            helper="Trabajos pendientes que debes revisar o actualizar."
            orders={ordenesActivas}
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
                      className={`appearance-none rounded-full border border-transparent pl-3 pr-8 py-1.5 text-[12px] font-extrabold outline-none ${
                        selectedOrder.status === 'Finalizada'
                          ? 'cursor-not-allowed opacity-60'
                          : 'cursor-pointer hover:opacity-80'
                      } focus:border-[#cbd5e1] ${
                        selectedOrder.status === 'En proceso'
                          ? 'bg-[#e8f7ef] text-[#0d6848]'
                          : selectedOrder.status === 'Finalizada'
                          ? 'bg-[#e5f7f8] text-[#0f6872]'
                          : selectedOrder.status === 'En revision'
                          ? 'bg-[#eaf2ff] text-[#1e55a8]'
                          : 'bg-[#fff7ed] text-[#9a4b00]'
                      }`}
                      value={selectedOrder.status}
                      disabled={selectedOrder.status === 'Finalizada'}
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

          {ordenesFinalizadas.length > 0 && (
            <OrdersTable
              title="Historial de ordenes finalizadas"
              helper="Ordenes completadas que ya no pueden ser modificadas."
              orders={ordenesFinalizadas}
              actionLabel="Ver detalle"
              onActionClick={() => {}}
              onRowClick={(order) => {
                setSelectedOrderId(order.id);
                setMostrarPista(false);
                setMensajeDetalle(null);
              }}
              selectedOrderId={selectedOrderId || undefined}
            />
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
