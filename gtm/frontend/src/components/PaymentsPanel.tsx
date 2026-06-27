import { useMemo, useState, type FormEvent } from 'react';
import type { RegistrarPagoPayload, MedioPago, TipoPago } from '../api/pagosApi';
import type { WorkOrder } from '../types';
import { Panel } from './Panel';

type PaymentsPanelProps = {
  guardandoPago: boolean;
  mensajePago: string | null;
  onEntregarOrden: (ordenId: string) => Promise<void>;
  onRegistrarPago: (pago: RegistrarPagoPayload) => Promise<boolean>;
  ordenes: WorkOrder[];
};

type FormularioPago = {
  ordenId: string;
  monto: string;
  tipoPago: TipoPago;
  medioPago: MedioPago;
  referenciaTransaccion: string;
};

const formularioInicial: FormularioPago = {
  ordenId: '',
  monto: '',
  tipoPago: 'Adelanto',
  medioPago: 'Efectivo',
  referenciaTransaccion: '',
};

const inputClass =
  'min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]';

const formatoMoneda = new Intl.NumberFormat('es-CL', {
  currency: 'CLP',
  maximumFractionDigits: 0,
  style: 'currency',
});

function obtenerIdNumerico(ordenId: string): number {
  return Number(ordenId.replace('OT-', ''));
}

export function PaymentsPanel({
  guardandoPago,
  mensajePago,
  onEntregarOrden,
  onRegistrarPago,
  ordenes,
}: PaymentsPanelProps) {
  const [formulario, setFormulario] = useState<FormularioPago>(formularioInicial);

  const ordenesParaCaja = useMemo(
    () =>
      ordenes.filter(
        (orden) =>
          (orden.saldoPendiente ?? 0) > 0 ||
          (orden.status === 'Finalizada' && (orden.saldoPendiente ?? 0) === 0),
      ),
    [ordenes],
  );

  const ordenSeleccionada = ordenes.find(
    (orden) => orden.id === formulario.ordenId,
  );

  function actualizarCampo(campo: keyof FormularioPago, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function completarMonto(tipoPago: TipoPago, monto: number) {
    setFormulario((actual) => ({
      ...actual,
      monto: String(monto),
      tipoPago,
    }));
  }

  async function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const pagoRegistrado = await onRegistrarPago({
      ordenTrabajoId: obtenerIdNumerico(formulario.ordenId),
      monto: Number(formulario.monto),
      tipoPago: formulario.tipoPago,
      medioPago: formulario.medioPago,
      referenciaTransaccion:
        formulario.referenciaTransaccion.trim() || undefined,
    });

    if (pagoRegistrado) {
      setFormulario(formularioInicial);
    }
  }

  return (
    <div className="grid gap-[18px]">
      <Panel>
        <div className="mb-4">
          <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">
            Caja
          </span>
          <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">
            Registrar pago de orden
          </h2>
          <p className="m-[6px_0_0] text-[14px] text-[#64748b]">
            Registra adelantos, pagos parciales o el pago final de una orden de
            trabajo.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={enviarFormulario}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
              Orden de trabajo
              <select
                className={inputClass}
                onChange={(evento) => actualizarCampo('ordenId', evento.target.value)}
                required
                value={formulario.ordenId}
              >
                <option value="">Seleccionar orden</option>
                {ordenesParaCaja.map((orden) => (
                  <option key={orden.id} value={orden.id}>
                    {orden.id} - {orden.client} - saldo {formatoMoneda.format(orden.saldoPendiente ?? 0)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
              Tipo de pago
              <select
                className={inputClass}
                onChange={(evento) =>
                  actualizarCampo('tipoPago', evento.target.value as TipoPago)
                }
                value={formulario.tipoPago}
              >
                <option value="Adelanto">Adelanto</option>
                <option value="Parcial">Parcial</option>
                <option value="Final">Final</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
              Monto
              <input
                className={inputClass}
                min="1"
                onChange={(evento) => actualizarCampo('monto', evento.target.value)}
                placeholder="Ej: 36000"
                required
                type="number"
                value={formulario.monto}
              />
            </label>

            <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
              Medio de pago
              <select
                className={inputClass}
                onChange={(evento) =>
                  actualizarCampo('medioPago', evento.target.value as MedioPago)
                }
                value={formulario.medioPago}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Electronico">Electronico</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-[13px] font-bold text-[#475569] md:col-span-2">
              Referencia de transaccion
              <input
                className={inputClass}
                onChange={(evento) =>
                  actualizarCampo('referenciaTransaccion', evento.target.value)
                }
                placeholder="Opcional para pago electronico"
                type="text"
                value={formulario.referenciaTransaccion}
              />
            </label>
          </div>

          {ordenSeleccionada && (
            <div className="grid gap-3 rounded-[7px] border border-[#dbe6ef] bg-[#f8fafc] p-4 md:grid-cols-6">
              <div>
                <p className="m-0 text-[12px] font-bold uppercase text-[#64748b]">Total</p>
                <strong className="text-[18px] text-[#111827]">
                  {formatoMoneda.format(ordenSeleccionada.total ?? 0)}
                </strong>
              </div>
              <div>
                <p className="m-0 text-[12px] font-bold uppercase text-[#64748b]">Descuento</p>
                <strong className="text-[18px] text-[#111827]">
                  {ordenSeleccionada.porcentajeDescuento ?? 0}%
                </strong>
                <span className="block text-[12px] text-[#64748b]">
                  {ordenSeleccionada.motivoDescuento ?? 'Sin descuento'}
                </span>
              </div>
              <div>
                <p className="m-0 text-[12px] font-bold uppercase text-[#64748b]">Adelanto</p>
                <strong className="text-[18px] text-[#111827]">
                  {formatoMoneda.format(ordenSeleccionada.adelantoRequerido ?? 0)}
                </strong>
              </div>
              <div>
                <p className="m-0 text-[12px] font-bold uppercase text-[#64748b]">Pagado</p>
                <strong className="text-[18px] text-[#111827]">
                  {formatoMoneda.format(ordenSeleccionada.totalPagado ?? 0)}
                </strong>
              </div>
              <div>
                <p className="m-0 text-[12px] font-bold uppercase text-[#64748b]">Saldo</p>
                <strong className="text-[18px] text-[#b91c1c]">
                  {formatoMoneda.format(ordenSeleccionada.saldoPendiente ?? 0)}
                </strong>
              </div>
              <div>
                <p className="m-0 text-[12px] font-bold uppercase text-[#64748b]">Estado pago</p>
                <strong className="text-[18px] text-[#111827]">
                  {ordenSeleccionada.estadoPago ?? 'Sin pago'}
                </strong>
              </div>
              <div className="flex flex-col gap-2 md:col-span-6 md:flex-row">
                <button
                  className="min-h-9 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[13px] font-bold text-[#1f2937] hover:bg-slate-50"
                  onClick={() =>
                    completarMonto(
                      'Adelanto',
                      Math.max(
                        (ordenSeleccionada.adelantoRequerido ?? 0) -
                          (ordenSeleccionada.totalPagado ?? 0),
                        0,
                      ),
                    )
                  }
                  type="button"
                >
                  Completar adelanto
                </button>
                <button
                  className="min-h-9 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[13px] font-bold text-[#1f2937] hover:bg-slate-50"
                  onClick={() =>
                    completarMonto('Final', ordenSeleccionada.saldoPendiente ?? 0)
                  }
                  type="button"
                >
                  Pagar saldo final
                </button>
                {ordenSeleccionada.status === 'Finalizada' &&
                  (ordenSeleccionada.saldoPendiente ?? 0) === 0 && (
                    <button
                      className="min-h-9 rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3 text-[13px] font-bold text-white hover:bg-[#0c5943]"
                      onClick={() => onEntregarOrden(ordenSeleccionada.id)}
                      type="button"
                    >
                      Marcar entregada
                    </button>
                  )}
              </div>
            </div>
          )}

          {mensajePago && (
            <p className="m-0 rounded-[7px] bg-[#eef4f2] p-3 text-[14px] font-bold text-[#0f6b52]">
              {mensajePago}
            </p>
          )}

          <div className="flex flex-col gap-2 md:flex-row md:justify-end">
            <button
              className="min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3.5 text-[14px] font-bold text-[#1f2937] hover:bg-slate-50"
              onClick={() => setFormulario(formularioInicial)}
              type="button"
            >
              Limpiar
            </button>
            <button
              className="min-h-10 rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 text-[14px] font-bold text-white hover:bg-[#0c5943] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={guardandoPago}
              type="submit"
            >
              {guardandoPago ? 'Registrando...' : 'Registrar pago'}
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
