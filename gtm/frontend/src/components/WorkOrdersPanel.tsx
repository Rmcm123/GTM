import { useState, type FormEvent } from 'react';
import type { CrearOrdenTrabajoPayload } from '../api/ordenesTrabajoApi';
import type { InventoryItem, WorkOrder } from '../types';
import { Panel } from './Panel';

type WorkOrdersPanelProps = {
  guardandoOrden: boolean;
  mensajeOrden: string | null;
  onCrearOrden: (orden: CrearOrdenTrabajoPayload) => Promise<boolean>;
  ordenes: WorkOrder[];
  inventario: InventoryItem[];
};

type FormularioOrden = {
  patente: string;
  diagnostico: string;
  tipoServicio: string;
  mecanico: string;
  fechaIngreso: string;
  costoManoObra: string;
};

const formularioInicial: FormularioOrden = {
  patente: '',
  diagnostico: '',
  tipoServicio: '',
  mecanico: '',
  fechaIngreso: '',
  costoManoObra: '',
};

type RepuestoOrden = {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
};

const mecanicos = ['Camila Torres', 'Matias Rojas', 'Diego Silva'];
const tiposServicio = [
  'Revision general',
  'Mantencion',
  'Reparacion',
  'Cambio de aceite',
  'Frenos',
];

const inputClass =
  'min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]';

const formatoMoneda = new Intl.NumberFormat('es-CL', {
  currency: 'CLP',
  maximumFractionDigits: 0,
  style: 'currency',
});

const estadoClass: Record<WorkOrder['status'], string> = {
  Pendiente: 'bg-[#fff7ed] text-[#9a4b00]',
  'En revision': 'bg-[#eaf2ff] text-[#1e55a8]',
  'En proceso': 'bg-[#e8f7ef] text-[#0d6848]',
  Finalizada: 'bg-[#e5f7f8] text-[#0f6872]',
  Entregada: 'bg-[#ecfdf5] text-[#047857]',
  Cancelada: 'bg-[#fef2f2] text-[#b91c1c]',
};

const estadoPagoClass: Record<string, string> = {
  'Sin pago': 'bg-[#fef2f2] text-[#b91c1c]',
  'Adelanto pagado': 'bg-[#fff7ed] text-[#9a4b00]',
  Pagada: 'bg-[#ecfdf5] text-[#047857]',
};

function obtenerClaseEstadoPago(estadoPago?: string) {
  return (
    estadoPagoClass[estadoPago ?? 'Sin pago'] ?? estadoPagoClass['Sin pago']
  );
}

export function WorkOrdersPanel({
  guardandoOrden,
  mensajeOrden,
  onCrearOrden,
  ordenes,
  inventario,
}: WorkOrdersPanelProps) {
  const [formulario, setFormulario] =
    useState<FormularioOrden>(formularioInicial);
  const [repuestoSeleccionado, setRepuestoSeleccionado] = useState('');
  const [cantidadRepuesto, setCantidadRepuesto] = useState('1');
  const [repuestosOrden, setRepuestosOrden] = useState<RepuestoOrden[]>([]);

  const ordenesActivas = ordenes.filter(
    (orden) => !['Finalizada', 'Entregada', 'Cancelada'].includes(orden.status),
  );
  const ordenesFinalizadas = ordenes.filter(
    (orden) => orden.status === 'Finalizada' || orden.status === 'Entregada',
  );
  const costoRepuestosCalculado = repuestosOrden.reduce(
    (total, repuesto) => total + repuesto.cantidad * repuesto.precioUnitario,
    0,
  );

  function actualizarCampo(campo: keyof FormularioOrden, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function agregarRepuesto() {
    const repuesto = inventario.find(
      (item) => item.name === repuestoSeleccionado,
    );
    const cantidad = Number(cantidadRepuesto);

    if (!repuesto || !Number.isInteger(cantidad) || cantidad <= 0) {
      return;
    }

    setRepuestosOrden((actuales) => {
      const repuestoExistente = actuales.find(
        (item) => item.nombre === repuesto.name,
      );

      if (repuestoExistente) {
        return actuales.map((item) =>
          item.nombre === repuesto.name
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item,
        );
      }

      return [
        ...actuales,
        {
          nombre: repuesto.name,
          cantidad,
          precioUnitario: repuesto.unitPrice,
        },
      ];
    });
    setRepuestoSeleccionado('');
    setCantidadRepuesto('1');
  }

  function quitarRepuesto(nombre: string) {
    setRepuestosOrden((actuales) =>
      actuales.filter((repuesto) => repuesto.nombre !== nombre),
    );
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial);
    setRepuestoSeleccionado('');
    setCantidadRepuesto('1');
    setRepuestosOrden([]);
  }

  async function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const ordenCreada = await onCrearOrden({
      patenteVehiculo: formulario.patente,
      tipoServicio: formulario.tipoServicio,
      diagnosticoInicial: formulario.diagnostico,
      mecanicoAsignado: formulario.mecanico || undefined,
      fechaIngreso: formulario.fechaIngreso,
      costoManoObra: Number(formulario.costoManoObra || 0),
      costoRepuestos: costoRepuestosCalculado,
      repuestos: repuestosOrden.map((repuesto) => ({
        nombre: repuesto.nombre,
        cantidad: repuesto.cantidad,
      })),
    });

    if (ordenCreada) {
      limpiarFormulario();
    }
  }

  function renderOrdenes(ordenesListado: WorkOrder[]) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse">
          <thead>
            <tr>
              {[
                'OT',
                'Cliente',
                'Vehiculo',
                'Estado OT',
                'Presupuesto',
                'Pago',
                'Saldo',
                'Ingreso',
              ].map((columna) => (
                <th
                  className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[12px_10px] text-left text-[12px] font-extrabold uppercase text-[#516071]"
                  key={columna}
                >
                  {columna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordenesListado.map((orden) => (
              <tr key={orden.id}>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px] font-bold text-[#111827]">
                  {orden.id}
                </td>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px]">
                  {orden.client}
                </td>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px]">
                  <span className="block font-bold text-[#111827]">
                    {orden.vehicle}
                  </span>
                  <span className="text-[12px] text-[#64748b]">
                    {orden.mechanic}
                  </span>
                </td>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px]">
                  <span
                    className={`inline-flex w-fit rounded-full px-2.5 py-1.5 text-[12px] font-extrabold ${estadoClass[orden.status]}`}
                  >
                    {orden.status}
                  </span>
                </td>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px]">
                  <span className="block font-extrabold text-[#111827]">
                    {formatoMoneda.format(orden.total ?? 0)}
                  </span>
                  <span className="text-[12px] text-[#64748b]">
                    Desc: {orden.porcentajeDescuento ?? 0}% ·{' '}
                    {orden.motivoDescuento ?? 'Sin descuento'}
                  </span>
                </td>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px]">
                  <span
                    className={`inline-flex w-fit rounded-full px-2.5 py-1.5 text-[12px] font-extrabold ${obtenerClaseEstadoPago(orden.estadoPago)}`}
                  >
                    {orden.estadoPago ?? 'Sin pago'}
                  </span>
                  <span className="mt-1 block text-[12px] text-[#64748b]">
                    Pagado: {formatoMoneda.format(orden.totalPagado ?? 0)}
                  </span>
                </td>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px] font-bold text-[#b91c1c]">
                  {formatoMoneda.format(orden.saldoPendiente ?? 0)}
                </td>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px]">
                  {orden.checkIn}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid gap-[18px]">
      <section className="grid gap-[18px]">
        <Panel>
          <div className="mb-4">
            <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">
              Recepcion
            </span>
            <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">
              Abrir orden de trabajo
            </h2>
            <p className="m-[6px_0_0] text-[14px] text-[#64748b]">
              Selecciona vehiculo, diagnostico inicial y mecanico asignado. El
              cliente se obtiene automaticamente del vehiculo.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={enviarFormulario}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Patente vehiculo
                <input
                  className={inputClass}
                  onChange={(evento) =>
                    actualizarCampo('patente', evento.target.value)
                  }
                  placeholder="Ej: ABCD-12"
                  type="text"
                  value={formulario.patente}
                />
              </label>

              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Tipo de servicio
                <select
                  className={inputClass}
                  onChange={(evento) =>
                    actualizarCampo('tipoServicio', evento.target.value)
                  }
                  value={formulario.tipoServicio}
                >
                  <option value="">Seleccionar servicio</option>
                  {tiposServicio.map((servicio) => (
                    <option key={servicio} value={servicio}>
                      {servicio}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Mecanico asignado
                <select
                  className={inputClass}
                  onChange={(evento) =>
                    actualizarCampo('mecanico', evento.target.value)
                  }
                  value={formulario.mecanico}
                >
                  <option value="">Seleccionar mecanico</option>
                  {mecanicos.map((mecanico) => (
                    <option key={mecanico} value={mecanico}>
                      {mecanico}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Fecha de ingreso
                <input
                  className={inputClass}
                  onChange={(evento) =>
                    actualizarCampo('fechaIngreso', evento.target.value)
                  }
                  type="date"
                  value={formulario.fechaIngreso}
                />
              </label>

              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Costo mano de obra
                <input
                  className={inputClass}
                  min="0"
                  onChange={(evento) =>
                    actualizarCampo('costoManoObra', evento.target.value)
                  }
                  placeholder="Ej: 50000"
                  type="number"
                  value={formulario.costoManoObra}
                />
              </label>

              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569] md:col-span-2">
                Diagnostico inicial
                <textarea
                  className="min-h-24 rounded-[7px] border border-[#cbd5e1] bg-white px-3 py-2 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]"
                  onChange={(evento) =>
                    actualizarCampo('diagnostico', evento.target.value)
                  }
                  placeholder="Describe el problema informado por el cliente o la revision solicitada."
                  value={formulario.diagnostico}
                />
              </label>
            </div>

            <div className="grid gap-3 rounded-[7px] border border-[#dbe6ef] bg-[#f8fafc] p-4">
              <div>
                <p className="m-0 text-[13px] font-extrabold uppercase text-[#475569]">
                  Repuestos para presupuesto
                </p>
                <p className="m-[4px_0_0] text-[13px] text-[#64748b]">
                  El costo de repuestos se calcula automaticamente segun el
                  precio unitario del inventario.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_auto]">
                <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                  Repuesto
                  <select
                    className={inputClass}
                    onChange={(evento) =>
                      setRepuestoSeleccionado(evento.target.value)
                    }
                    value={repuestoSeleccionado}
                  >
                    <option value="">Seleccionar repuesto</option>
                    {inventario.map((item) => (
                      <option key={item.id ?? item.name} value={item.name}>
                        {item.name} - {formatoMoneda.format(item.unitPrice)} (
                        {item.stock} disponibles)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                  Cantidad
                  <input
                    className={inputClass}
                    min="1"
                    onChange={(evento) =>
                      setCantidadRepuesto(evento.target.value)
                    }
                    type="number"
                    value={cantidadRepuesto}
                  />
                </label>

                <button
                  className="mt-auto min-h-10 rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 text-[14px] font-bold text-white hover:bg-[#0c5943]"
                  onClick={agregarRepuesto}
                  type="button"
                >
                  Agregar
                </button>
              </div>

              {repuestosOrden.length > 0 && (
                <div className="grid gap-2">
                  {repuestosOrden.map((repuesto) => (
                    <div
                      className="flex flex-col gap-2 rounded-[7px] bg-white p-3 md:flex-row md:items-center md:justify-between"
                      key={repuesto.nombre}
                    >
                      <div>
                        <strong className="block text-[14px] text-[#111827]">
                          {repuesto.nombre}
                        </strong>
                        <span className="text-[13px] text-[#64748b]">
                          {repuesto.cantidad} x{' '}
                          {formatoMoneda.format(repuesto.precioUnitario)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <strong className="text-[14px] text-[#111827]">
                          {formatoMoneda.format(
                            repuesto.cantidad * repuesto.precioUnitario,
                          )}
                        </strong>
                        <button
                          className="rounded-[7px] border border-[#fecaca] bg-[#fef2f2] px-3 py-1 text-[13px] font-bold text-[#b91c1c]"
                          onClick={() => quitarRepuesto(repuesto.nombre)}
                          type="button"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end border-t border-[#e5eaf0] pt-3">
                <strong className="text-[15px] text-[#111827]">
                  Total repuestos:{' '}
                  {formatoMoneda.format(costoRepuestosCalculado)}
                </strong>
              </div>
            </div>

            {mensajeOrden && (
              <p className="m-0 rounded-[7px] bg-[#eef4f2] p-3 text-[14px] font-bold text-[#0f6b52]">
                {mensajeOrden}
              </p>
            )}

            <div className="flex flex-col gap-2 md:flex-row md:justify-end">
              <button
                className="min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3.5 text-[14px] font-bold text-[#1f2937] hover:bg-slate-50"
                onClick={limpiarFormulario}
                type="button"
              >
                Limpiar
              </button>
              <button
                className="min-h-10 rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 text-[14px] font-bold text-white hover:bg-[#0c5943] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={guardandoOrden}
                type="submit"
              >
                {guardandoOrden ? 'Creando...' : 'Crear orden'}
              </button>
            </div>
          </form>
        </Panel>
      </section>

      <Panel>
        <div className="mb-3">
          <h3 className="m-0 text-[16px] font-extrabold text-[#111827]">
            Ordenes activas
          </h3>
          <p className="m-[6px_0_0] text-[13px] text-[#64748b]">
            Ordenes pendientes, en revision o en proceso.
          </p>
        </div>
        {renderOrdenes(ordenesActivas)}
      </Panel>

      <Panel>
        <div className="mb-3">
          <h3 className="m-0 text-[16px] font-extrabold text-[#111827]">
            Ordenes finalizadas
          </h3>
          <p className="m-[6px_0_0] text-[13px] text-[#64748b]">
            Trabajos terminados que quedan listos para entrega o historial.
          </p>
        </div>
        {renderOrdenes(ordenesFinalizadas)}
      </Panel>
    </div>
  );
}
