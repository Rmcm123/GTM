import { useState, type FormEvent } from 'react';
import type { CrearOrdenTrabajoPayload } from '../api/ordenesTrabajoApi';
import type { WorkOrder } from '../types';
import { Panel } from './Panel';

type WorkOrdersPanelProps = {
  guardandoOrden: boolean;
  mensajeOrden: string | null;
  onCrearOrden: (orden: CrearOrdenTrabajoPayload) => Promise<boolean>;
  ordenes: WorkOrder[];
};

type FormularioOrden = {
  patente: string;
  diagnostico: string;
  tipoServicio: string;
  mecanico: string;
  fechaIngreso: string;
  costoManoObra: string;
  costoRepuestos: string;
};

const formularioInicial: FormularioOrden = {
  patente: '',
  diagnostico: '',
  tipoServicio: '',
  mecanico: '',
  fechaIngreso: '',
  costoManoObra: '',
  costoRepuestos: '',
};

const mecanicos = ['Camila Torres', 'Matias Rojas', 'Diego Silva'];
const tiposServicio = ['Revision general', 'Mantencion', 'Reparacion', 'Cambio de aceite', 'Frenos'];

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

export function WorkOrdersPanel({ guardandoOrden, mensajeOrden, onCrearOrden, ordenes }: WorkOrdersPanelProps) {
  const [formulario, setFormulario] = useState<FormularioOrden>(formularioInicial);

  const ordenesActivas = ordenes.filter((orden) => !['Finalizada', 'Entregada', 'Cancelada'].includes(orden.status));
  const ordenesFinalizadas = ordenes.filter((orden) => orden.status === 'Finalizada' || orden.status === 'Entregada');

  function actualizarCampo(campo: keyof FormularioOrden, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
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
      costoRepuestos: Number(formulario.costoRepuestos || 0),
    });

    if (ordenCreada) {
      setFormulario(formularioInicial);
    }
  }

  function renderOrdenes(ordenesListado: WorkOrder[]) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse">
          <thead>
            <tr>
            {['OT', 'Cliente', 'Vehiculo', 'Mecanico', 'Estado', 'Saldo', 'Ingreso'].map((columna) => (
                <th className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[12px_10px] text-left text-[12px] font-extrabold uppercase text-[#516071]" key={columna}>
                  {columna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordenesListado.map((orden) => (
              <tr key={orden.id}>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px] font-bold text-[#111827]">{orden.id}</td>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px]">{orden.client}</td>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px]">{orden.vehicle}</td>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px]">{orden.mechanic}</td>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px]">
                  <span className={`inline-flex w-fit rounded-full px-2.5 py-1.5 text-[12px] font-extrabold ${estadoClass[orden.status]}`}>{orden.status}</span>
                </td>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px] font-bold">{formatoMoneda.format(orden.saldoPendiente ?? 0)}</td>
                <td className="border-b border-[#e5eaf0] p-[12px_10px] text-[14px]">{orden.checkIn}</td>
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
            <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Recepcion</span>
            <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Abrir orden de trabajo</h2>
            <p className="m-[6px_0_0] text-[14px] text-[#64748b]">
              Selecciona vehiculo, diagnostico inicial y mecanico asignado. El cliente se obtiene automáticamente del vehículo.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={enviarFormulario}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Patente vehiculo
                <input
                  className={inputClass}
                  onChange={(evento) => actualizarCampo('patente', evento.target.value)}
                  placeholder="Ej: ABCD-12"
                  type="text"
                  value={formulario.patente}
                />
              </label>

              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Tipo de servicio
                <select className={inputClass} onChange={(evento) => actualizarCampo('tipoServicio', evento.target.value)} value={formulario.tipoServicio}>
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
                <select className={inputClass} onChange={(evento) => actualizarCampo('mecanico', evento.target.value)} value={formulario.mecanico}>
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
                <input className={inputClass} onChange={(evento) => actualizarCampo('fechaIngreso', evento.target.value)} type="date" value={formulario.fechaIngreso} />
              </label>

              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Costo mano de obra
                <input
                  className={inputClass}
                  min="0"
                  onChange={(evento) => actualizarCampo('costoManoObra', evento.target.value)}
                  placeholder="Ej: 50000"
                  type="number"
                  value={formulario.costoManoObra}
                />
              </label>

              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Costo repuestos
                <input
                  className={inputClass}
                  min="0"
                  onChange={(evento) => actualizarCampo('costoRepuestos', evento.target.value)}
                  placeholder="Ej: 40000"
                  type="number"
                  value={formulario.costoRepuestos}
                />
              </label>

              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569] md:col-span-2">
                Diagnostico inicial
                <textarea
                  className="min-h-24 rounded-[7px] border border-[#cbd5e1] bg-white px-3 py-2 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]"
                  onChange={(evento) => actualizarCampo('diagnostico', evento.target.value)}
                  placeholder="Describe el problema informado por el cliente o la revision solicitada."
                  value={formulario.diagnostico}
                />
              </label>
            </div>

            {mensajeOrden && <p className="m-0 rounded-[7px] bg-[#eef4f2] p-3 text-[14px] font-bold text-[#0f6b52]">{mensajeOrden}</p>}

            <div className="flex flex-col gap-2 md:flex-row md:justify-end">
              <button className="min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3.5 text-[14px] font-bold text-[#1f2937] hover:bg-slate-50" onClick={() => setFormulario(formularioInicial)} type="button">
                Limpiar
              </button>
              <button className="min-h-10 rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 text-[14px] font-bold text-white hover:bg-[#0c5943] disabled:cursor-not-allowed disabled:opacity-60" disabled={guardandoOrden} type="submit">
                {guardandoOrden ? 'Creando...' : 'Crear orden'}
              </button>
            </div>
          </form>
        </Panel>
      </section>

      <Panel>
        <div className="mb-3">
          <h3 className="m-0 text-[16px] font-extrabold text-[#111827]">Ordenes activas</h3>
          <p className="m-[6px_0_0] text-[13px] text-[#64748b]">Ordenes pendientes, en revision o en proceso.</p>
        </div>
        {renderOrdenes(ordenesActivas)}
      </Panel>

      <Panel>
        <div className="mb-3">
          <h3 className="m-0 text-[16px] font-extrabold text-[#111827]">Ordenes finalizadas</h3>
          <p className="m-[6px_0_0] text-[13px] text-[#64748b]">Trabajos terminados que quedan listos para entrega o historial.</p>
        </div>
        {renderOrdenes(ordenesFinalizadas)}
      </Panel>
    </div>
  );
}
