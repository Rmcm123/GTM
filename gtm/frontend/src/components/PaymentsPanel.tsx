import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  obtenerPagosPorOrden,
  type MedioPago,
  type PagoRespuesta,
  type RegistrarPagoPayload,
  type TipoPago,
} from '../api/pagosApi';
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
  proveedorPago: string;
  referenciaTransaccion: string;
};

const formularioInicial: FormularioPago = {
  ordenId: '',
  monto: '',
  tipoPago: 'Adelanto',
  medioPago: 'Efectivo',
  proveedorPago: '',
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

function normalizarBusqueda(valor: string): string {
  return valor.trim().toLowerCase();
}

function obtenerMontoAdelantoPendiente(orden: WorkOrder): number {
  return Math.max((orden.adelantoRequerido ?? 0) - (orden.totalPagado ?? 0), 0);
}

function obtenerEstadoCaja(orden: WorkOrder): {
  label: string;
  className: string;
} {
  if ((orden.saldoPendiente ?? 0) <= 0) {
    return {
      label: 'Pagada',
      className: 'bg-[#dcfce7] text-[#166534]',
    };
  }

  if ((orden.totalPagado ?? 0) >= (orden.adelantoRequerido ?? 0)) {
    return {
      label: 'Adelanto pagado',
      className: 'bg-[#dbeafe] text-[#1d4ed8]',
    };
  }

  return {
    label: 'Adelanto pendiente',
    className: 'bg-[#fee2e2] text-[#b91c1c]',
  };
}

function obtenerAvisoFormulario(
  formulario: FormularioPago,
  saldoPendiente: number,
): string | null {
  const monto = Number(formulario.monto);

  if (
    formulario.tipoPago === 'Final' &&
    monto > 0 &&
    monto !== saldoPendiente
  ) {
    return 'El pago final debe cubrir exactamente el saldo pendiente.';
  }

  if (
    formulario.medioPago === 'Electronico' &&
    formulario.proveedorPago.trim().length === 0
  ) {
    return 'Selecciona el proveedor del pago electronico.';
  }

  if (
    formulario.medioPago === 'Electronico' &&
    formulario.referenciaTransaccion.trim().length === 0
  ) {
    return 'Los pagos electronicos necesitan referencia de transaccion.';
  }

  return null;
}

export function PaymentsPanel({
  guardandoPago,
  mensajePago,
  onEntregarOrden,
  onRegistrarPago,
  ordenes,
}: PaymentsPanelProps) {
  const [formulario, setFormulario] =
    useState<FormularioPago>(formularioInicial);
  const [busqueda, setBusqueda] = useState('');
  const [pagosOrden, setPagosOrden] = useState<PagoRespuesta[]>([]);
  const [cargandoPagos, setCargandoPagos] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  const ordenSeleccionada = ordenes.find(
    (orden) => orden.id === formulario.ordenId,
  );

  const ordenesParaCaja = useMemo(() => {
    const textoBusqueda = normalizarBusqueda(busqueda);
    const ordenesCandidatas = ordenes.filter(
      (orden) => orden.status !== 'Cancelada' && orden.status !== 'Entregada',
    );

    const ordenesFiltradas = textoBusqueda
      ? ordenesCandidatas.filter((orden) =>
          [
            orden.id,
            orden.client,
            orden.rutCliente,
            orden.patenteVehiculo,
            orden.vehicle,
          ]
            .filter(Boolean)
            .some((valor) =>
              normalizarBusqueda(String(valor)).includes(textoBusqueda),
            ),
        )
      : ordenesCandidatas;

    return ordenesFiltradas.slice(0, 6);
  }, [busqueda, ordenes]);

  useEffect(() => {
    if (!ordenSeleccionada) {
      setPagosOrden([]);
      return;
    }

    const adelantoPendiente = obtenerMontoAdelantoPendiente(ordenSeleccionada);
    const saldoPendiente = ordenSeleccionada.saldoPendiente ?? 0;

    setFormulario((actual) => ({
      ...actual,
      monto:
        adelantoPendiente > 0
          ? String(adelantoPendiente)
          : saldoPendiente > 0
            ? String(saldoPendiente)
            : '',
      tipoPago: adelantoPendiente > 0 ? 'Adelanto' : 'Final',
      referenciaTransaccion: '',
    }));

    const ordenIdSeleccionada = ordenSeleccionada.id;

    async function cargarHistorialPagos() {
      setCargandoPagos(true);
      setErrorHistorial(null);

      try {
        const pagos = await obtenerPagosPorOrden(
          obtenerIdNumerico(ordenIdSeleccionada),
        );
        setPagosOrden(pagos);
      } catch (error) {
        setPagosOrden([]);
        setErrorHistorial(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar el historial de pagos',
        );
      } finally {
        setCargandoPagos(false);
      }
    }

    void cargarHistorialPagos();
  }, [ordenSeleccionada]);

  function actualizarCampo(campo: keyof FormularioPago, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
      ...(campo === 'medioPago' && valor === 'Efectivo'
        ? { proveedorPago: '', referenciaTransaccion: '' }
        : {}),
    }));
  }

  function seleccionarOrden(ordenId: string) {
    setFormulario((actual) => ({
      ...actual,
      ordenId,
    }));
  }

  function completarMonto(tipoPago: TipoPago, monto: number) {
    setFormulario((actual) => ({
      ...actual,
      monto: monto > 0 ? String(monto) : '',
      tipoPago,
    }));
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial);
    setBusqueda('');
    setPagosOrden([]);
    setErrorHistorial(null);
  }

  async function recargarHistorialPagos() {
    if (!ordenSeleccionada) {
      return;
    }

    const pagos = await obtenerPagosPorOrden(
      obtenerIdNumerico(ordenSeleccionada.id),
    );
    setPagosOrden(pagos);
  }

  async function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!ordenSeleccionada) {
      return;
    }

    const pagoRegistrado = await onRegistrarPago({
      ordenTrabajoId: obtenerIdNumerico(formulario.ordenId),
      monto: Number(formulario.monto),
      tipoPago: formulario.tipoPago,
      medioPago: formulario.medioPago,
      proveedorPago: formulario.proveedorPago.trim() || undefined,
      referenciaTransaccion:
        formulario.referenciaTransaccion.trim() || undefined,
    });

    if (pagoRegistrado) {
      setFormulario((actual) => ({
        ...actual,
        monto: '',
        referenciaTransaccion: '',
      }));
      await recargarHistorialPagos();
    }
  }

  const estadoCaja = ordenSeleccionada
    ? obtenerEstadoCaja(ordenSeleccionada)
    : null;
  const adelantoPendiente = ordenSeleccionada
    ? obtenerMontoAdelantoPendiente(ordenSeleccionada)
    : 0;
  const saldoPendiente = ordenSeleccionada?.saldoPendiente ?? 0;
  const puedeEntregar =
    ordenSeleccionada?.status === 'Finalizada' && saldoPendiente === 0;
  const avisoFormulario = obtenerAvisoFormulario(formulario, saldoPendiente);

  return (
    <div className="grid gap-[18px]">
      <Panel>
        <div className="mb-4">
          <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">
            Caja
          </span>
          <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">
            Registrar pagos y cerrar orden
          </h2>
          <p className="m-[6px_0_0] text-[14px] text-[#64748b]">
            Busca una orden por OT, RUT, patente o cliente para registrar el
            adelanto, pagos parciales o el saldo final.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(280px,360px)_1fr]">
          <aside className="grid content-start gap-3">
            <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
              Buscar orden
              <input
                className={inputClass}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Ej: OT-003, 12.345, ABCD12"
                type="search"
                value={busqueda}
              />
            </label>

            <div className="grid max-h-[430px] gap-2 overflow-auto pr-1">
              {ordenesParaCaja.map((orden) => {
                const estado = obtenerEstadoCaja(orden);
                const estaSeleccionada = orden.id === formulario.ordenId;

                return (
                  <button
                    className={`rounded-[7px] border p-3 text-left transition ${
                      estaSeleccionada
                        ? 'border-[#0f6b52] bg-[#eef4f2]'
                        : 'border-[#dbe6ef] bg-white hover:bg-slate-50'
                    }`}
                    key={orden.id}
                    onClick={() => seleccionarOrden(orden.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <strong className="text-[14px] text-[#111827]">
                        {orden.id}
                      </strong>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-bold ${estado.className}`}
                      >
                        {estado.label}
                      </span>
                    </div>
                    <span className="mt-1 block text-[13px] font-bold text-[#334155]">
                      {orden.client}
                    </span>
                    <span className="block text-[12px] text-[#64748b]">
                      {orden.rutCliente ?? 'RUT no disponible'} -{' '}
                      {orden.patenteVehiculo ?? orden.vehicle}
                    </span>
                    <span className="mt-1 block text-[12px] font-bold text-[#b91c1c]">
                      Saldo: {formatoMoneda.format(orden.saldoPendiente ?? 0)}
                    </span>
                  </button>
                );
              })}

              {ordenesParaCaja.length === 0 && (
                <p className="m-0 rounded-[7px] border border-dashed border-[#cbd5e1] p-4 text-[13px] text-[#64748b]">
                  No hay ordenes que coincidan con la busqueda.
                </p>
              )}
            </div>
          </aside>

          <form
            className="grid content-start gap-4"
            onSubmit={enviarFormulario}
          >
            {ordenSeleccionada ? (
              <div className="grid gap-3 rounded-[7px] border border-[#dbe6ef] bg-[#f8fafc] p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="m-0 text-[18px] font-extrabold text-[#111827]">
                      {ordenSeleccionada.id} - {ordenSeleccionada.client}
                    </h3>
                    <p className="m-[4px_0_0] text-[13px] text-[#64748b]">
                      {ordenSeleccionada.vehicle} - Estado:{' '}
                      {ordenSeleccionada.status}
                    </p>
                  </div>
                  {estadoCaja && (
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-[12px] font-bold ${estadoCaja.className}`}
                    >
                      {estadoCaja.label}
                    </span>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="m-0 text-[12px] font-bold uppercase text-[#64748b]">
                      Total
                    </p>
                    <strong className="text-[18px] text-[#111827]">
                      {formatoMoneda.format(ordenSeleccionada.total ?? 0)}
                    </strong>
                  </div>
                  <div>
                    <p className="m-0 text-[12px] font-bold uppercase text-[#64748b]">
                      Adelanto 40%
                    </p>
                    <strong className="text-[18px] text-[#111827]">
                      {formatoMoneda.format(
                        ordenSeleccionada.adelantoRequerido ?? 0,
                      )}
                    </strong>
                  </div>
                  <div>
                    <p className="m-0 text-[12px] font-bold uppercase text-[#64748b]">
                      Pagado
                    </p>
                    <strong className="text-[18px] text-[#111827]">
                      {formatoMoneda.format(ordenSeleccionada.totalPagado ?? 0)}
                    </strong>
                  </div>
                  <div>
                    <p className="m-0 text-[12px] font-bold uppercase text-[#64748b]">
                      Saldo
                    </p>
                    <strong className="text-[18px] text-[#b91c1c]">
                      {formatoMoneda.format(saldoPendiente)}
                    </strong>
                  </div>
                </div>

                <div className="rounded-[7px] border border-[#dbe6ef] bg-white p-3">
                  <p className="m-0 text-[12px] font-bold uppercase text-[#64748b]">
                    Presupuesto y descuento
                  </p>
                  <p className="m-[6px_0_0] text-[13px] text-[#334155]">
                    Mano de obra:{' '}
                    <strong>
                      {formatoMoneda.format(
                        ordenSeleccionada.costoManoObra ?? 0,
                      )}
                    </strong>{' '}
                    - Repuestos:{' '}
                    <strong>
                      {formatoMoneda.format(
                        ordenSeleccionada.costoRepuestos ?? 0,
                      )}
                    </strong>{' '}
                    - Descuento:{' '}
                    <strong>
                      {ordenSeleccionada.porcentajeDescuento ?? 0}% (
                      {ordenSeleccionada.motivoDescuento ?? 'Sin descuento'})
                    </strong>
                  </p>
                </div>

                <div className="flex flex-col gap-2 md:flex-row">
                  <button
                    className="min-h-9 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[13px] font-bold text-[#1f2937] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={adelantoPendiente <= 0}
                    onClick={() =>
                      completarMonto('Adelanto', adelantoPendiente)
                    }
                    type="button"
                  >
                    Completar adelanto
                  </button>
                  <button
                    className="min-h-9 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[13px] font-bold text-[#1f2937] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={saldoPendiente <= 0}
                    onClick={() => completarMonto('Final', saldoPendiente)}
                    type="button"
                  >
                    Pagar saldo final
                  </button>
                  {puedeEntregar && (
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
            ) : (
              <div className="rounded-[7px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-5">
                <h3 className="m-0 text-[17px] font-extrabold text-[#111827]">
                  Selecciona una orden
                </h3>
                <p className="m-[6px_0_0] text-[14px] text-[#64748b]">
                  La caja necesita una orden seleccionada para calcular
                  adelanto, saldo y habilitar el cierre.
                </p>
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Tipo de pago
                <select
                  className={inputClass}
                  disabled={!ordenSeleccionada}
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
                  disabled={!ordenSeleccionada}
                  min="1"
                  onChange={(evento) =>
                    actualizarCampo('monto', evento.target.value)
                  }
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
                  disabled={!ordenSeleccionada}
                  onChange={(evento) =>
                    actualizarCampo(
                      'medioPago',
                      evento.target.value as MedioPago,
                    )
                  }
                  value={formulario.medioPago}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Electronico">Electronico</option>
                </select>
              </label>

              {formulario.medioPago === 'Electronico' && (
                <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                  Proveedor de pago
                  <select
                    className={inputClass}
                    disabled={!ordenSeleccionada}
                    onChange={(evento) =>
                      actualizarCampo('proveedorPago', evento.target.value)
                    }
                    required
                    value={formulario.proveedorPago}
                  >
                    <option value="">Seleccionar proveedor</option>
                    <option value="Mercado Pago">Mercado Pago</option>
                    <option value="Transferencia bancaria">
                      Transferencia bancaria
                    </option>
                    <option value="Transbank">Transbank</option>
                    <option value="Otro">Otro</option>
                  </select>
                </label>
              )}

              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Comprobante o referencia
                <input
                  className={inputClass}
                  disabled={!ordenSeleccionada}
                  onChange={(evento) =>
                    actualizarCampo(
                      'referenciaTransaccion',
                      evento.target.value,
                    )
                  }
                  placeholder={
                    formulario.medioPago === 'Electronico'
                      ? 'Ej: MP-123456, transferencia 98421'
                      : 'Opcional para efectivo'
                  }
                  required={formulario.medioPago === 'Electronico'}
                  type="text"
                  value={formulario.referenciaTransaccion}
                />
              </label>
            </div>

            {mensajePago && (
              <p className="m-0 rounded-[7px] bg-[#eef4f2] p-3 text-[14px] font-bold text-[#0f6b52]">
                {mensajePago}
              </p>
            )}

            {ordenSeleccionada && avisoFormulario && (
              <p className="m-0 rounded-[7px] bg-[#fff7ed] p-3 text-[14px] font-bold text-[#9a3412]">
                {avisoFormulario}
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
                disabled={
                  guardandoPago ||
                  !ordenSeleccionada ||
                  !formulario.monto ||
                  Number(formulario.monto) <= 0 ||
                  Boolean(avisoFormulario)
                }
                type="submit"
              >
                {guardandoPago ? 'Registrando...' : 'Registrar pago'}
              </button>
            </div>
          </form>
        </div>
      </Panel>

      <Panel>
        <div className="mb-4">
          <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">
            Historial
          </span>
          <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">
            Pagos registrados
          </h2>
        </div>

        {!ordenSeleccionada && (
          <p className="m-0 text-[14px] text-[#64748b]">
            Selecciona una orden para ver sus pagos.
          </p>
        )}

        {ordenSeleccionada && cargandoPagos && (
          <p className="m-0 text-[14px] text-[#64748b]">
            Cargando historial de pagos...
          </p>
        )}

        {ordenSeleccionada && errorHistorial && (
          <p className="m-0 rounded-[7px] bg-[#fee2e2] p-3 text-[14px] font-bold text-[#b91c1c]">
            {errorHistorial}
          </p>
        )}

        {ordenSeleccionada &&
          !cargandoPagos &&
          !errorHistorial &&
          pagosOrden.length === 0 && (
            <p className="m-0 text-[14px] text-[#64748b]">
              Esta orden aun no tiene pagos registrados.
            </p>
          )}

        {pagosOrden.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[14px]">
              <thead>
                <tr className="border-b border-[#dbe6ef] text-[12px] uppercase text-[#64748b]">
                  <th className="py-3 pr-3">Fecha</th>
                  <th className="py-3 pr-3">Tipo</th>
                  <th className="py-3 pr-3">Medio</th>
                  <th className="py-3 pr-3">Proveedor</th>
                  <th className="py-3 pr-3">Monto</th>
                  <th className="py-3 pr-3">Saldo posterior</th>
                  <th className="py-3 pr-3">Referencia</th>
                </tr>
              </thead>
              <tbody>
                {pagosOrden.map((pago) => (
                  <tr
                    className="border-b border-[#eef2f7] text-[#334155]"
                    key={pago.id}
                  >
                    <td className="py-3 pr-3">
                      {new Date(pago.creadoEn).toLocaleString('es-CL')}
                    </td>
                    <td className="py-3 pr-3 font-bold">{pago.tipoPago}</td>
                    <td className="py-3 pr-3">{pago.medioPago}</td>
                    <td className="py-3 pr-3">
                      {pago.proveedorPago ?? 'No aplica'}
                    </td>
                    <td className="py-3 pr-3 font-bold text-[#111827]">
                      {formatoMoneda.format(pago.monto)}
                    </td>
                    <td className="py-3 pr-3">
                      {formatoMoneda.format(pago.saldoPendienteOrden)}
                    </td>
                    <td className="py-3 pr-3">
                      {pago.referenciaTransaccion ?? 'Sin referencia'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
