import type { FormEvent } from 'react';
import type { AlertaStockBajo, InventoryItem, StockMovement } from '../types';
import { Panel } from './Panel';

type InventoryFormState = {
  nombre: string;
  categoria: string;
  minimo: string;
  stock: string;
  cantidad: string;
  nota: string;
};

type InventoryPanelProps = {
  items: InventoryItem[];
  movements?: StockMovement[];
  alertasStockBajo?: AlertaStockBajo[];
  showMovements?: boolean;
  showStockList?: boolean;
  cargando?: boolean;
  mensaje?: string | null;
  title?: string;
  formulario?: InventoryFormState;
  onActualizarCampo?: (campo: keyof InventoryFormState, valor: string) => void;
  onActualizarStock?: () => Promise<void>;
  onRegistrarEntrada?: () => Promise<void>;
  onRegistrarSalida?: () => Promise<void>;
};

const inputClass =
  'min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]';

export function InventoryPanel({
  items = [],
  movements = [],
  alertasStockBajo = [],
  showMovements = false,
  showStockList = true,
  cargando = false,
  mensaje,
  title = 'Stock de repuestos',
  formulario,
  onActualizarCampo,
  onActualizarStock,
  onRegistrarEntrada,
  onRegistrarSalida,
}: InventoryPanelProps) {
  const tieneFormulario =
    Boolean(formulario) &&
    Boolean(onActualizarCampo) &&
    Boolean(onActualizarStock) &&
    Boolean(onRegistrarEntrada) &&
    Boolean(onRegistrarSalida);

  function bloquearEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
  }

  return (
    <Panel>
      <div className="mb-3 flex flex-col items-start justify-between gap-3.5 md:flex-row md:items-center">
        <div>
          <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Inventario</span>
          <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">{title}</h2>
        </div>
      </div>

      {alertasStockBajo.length > 0 && (
        <div className="mb-4 grid gap-2 rounded-[8px] border border-[#fed7aa] bg-[#fff7ed] p-3">
          <span className="text-[12px] font-extrabold uppercase text-[#9a3412]">Alerta stock bajo</span>
          {alertasStockBajo.map((alerta) => (
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between" key={`${alerta.repuestoId}-${alerta.creadoEn}`}>
              <strong className="text-[14px] text-[#111827]">{alerta.mensaje}</strong>
              <span className="text-[13px] font-bold text-[#9a3412]">
                minimo {alerta.minimo}
              </span>
            </div>
          ))}
        </div>
      )}

      {showStockList && (
        <div className="grid">
          {!Array.isArray(items) || items.length === 0 ? (
            <p className="py-6 text-center text-[14px] text-[#64748b]">No hay repuestos para mostrar.</p>
          ) : (
            items.map((item, index) => (
              <div className={`flex justify-between gap-3.5 py-3.5 ${index === 0 ? '' : 'border-t border-[#e5eaf0]'}`} key={item?.id ?? item?.name ?? index}>
                <div className="grid gap-0.5">
                  <strong className="text-[14px] font-bold text-[#111827]">{item?.name || 'Desconocido'}</strong>
                  <span className="text-[14px] text-[#64748b]">{item?.category || 'Sin categoría'} · Minimo: {item?.minimum || 0}</span>
                </div>
                {(item?.stock || 0) < (item?.minimum || 0) ? (
                  <span className="self-center whitespace-nowrap rounded-full bg-[#fff3df] px-2.5 py-1 text-[14px] font-extrabold text-[#9a4b00]">
                    {item?.stock || 0} unidades
                  </span>
                ) : (
                  <span className="self-center whitespace-nowrap text-[14px] text-[#64748b]">{item?.stock || 0} unidades</span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tieneFormulario && formulario && onActualizarCampo && onActualizarStock && onRegistrarEntrada && onRegistrarSalida && (
        <div id="update-stock-top" className="mt-5 border-t border-[#e5eaf0] pt-4">
          <div className="mb-3">
            <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Crear repuesto</span>
            <p className="m-0 text-[14px] text-[#64748b]">Ingresa los datos basicos del repuesto para agregarlo al inventario.</p>
          </div>

          <form className="grid gap-4" onSubmit={bloquearEnvio}>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Nombre del repuesto
                <input
                  className={inputClass}
                  onChange={(evento) => onActualizarCampo('nombre', evento.target.value)}
                  placeholder="Ej: Aceite 10W-40"
                  type="text"
                  value={formulario.nombre}
                />
              </label>
              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Categoria
                <input
                  className={inputClass}
                  onChange={(evento) => onActualizarCampo('categoria', evento.target.value)}
                  placeholder="Ej: Lubricantes"
                  type="text"
                  value={formulario.categoria}
                />
              </label>
              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Stock minimo
                <input
                  className={inputClass}
                  onChange={(evento) => onActualizarCampo('minimo', evento.target.value)}
                  placeholder="Minimo requerido"
                  type="number"
                  min="1"
                  value={formulario.minimo}
                />
              </label>
            </div>

            {mensaje && <p className="m-0 rounded-[7px] bg-[#eef4f2] p-3 text-[14px] font-bold text-[#0f6b52]">{mensaje}</p>}

            <div className="mt-2 flex justify-end">
              <button className="min-h-10 rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 text-[14px] font-bold text-white hover:bg-[#0c5943] disabled:cursor-not-allowed disabled:opacity-60" disabled={cargando} onClick={onActualizarStock} type="button">
                Crear repuesto
              </button>
            </div>
          </form>

          <div id="register-entry" className="mt-8 border-t border-[#e5eaf0] pt-6">
            <div className="mb-3">
              <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Reponer repuesto</span>
              <p className="m-0 text-[14px] text-[#64748b]">Selecciona un repuesto existente y agregale stock.</p>
            </div>

            <form className="grid gap-4" onSubmit={bloquearEnvio}>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                  Repuesto a reponer
                  <select
                    className={inputClass}
                    onChange={(evento) => {
                      onActualizarCampo('nombre', evento.target.value);
                    }}
                    value={formulario.nombre}
                  >
                    <option value="">-- Selecciona un repuesto --</option>
                    {items.map((item) => (
                      <option key={item?.id ?? item?.name} value={item?.name || ''}>
                        {item?.name || 'Desconocido'} ({item?.stock || 0} unidades)
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                  Cantidad a ingresar
                  <input
                    className={inputClass}
                    onChange={(evento) => onActualizarCampo('cantidad', evento.target.value)}
                    placeholder="Cantidad a sumar"
                    type="number"
                    min="1"
                    value={formulario.cantidad}
                  />
                </label>
              </div>

              {mensaje && <p className="m-0 rounded-[7px] bg-[#eef4f2] p-3 text-[14px] font-bold text-[#0f6b52]">{mensaje}</p>}

              <div className="mt-2 flex justify-end">
                <button className="min-h-10 rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 text-[14px] font-bold text-white hover:bg-[#0c5943] disabled:cursor-not-allowed disabled:opacity-60" disabled={cargando} onClick={onRegistrarEntrada} type="button">
                  Reponer repuesto
                </button>
              </div>
            </form>
          </div>

          <div id="register-output" className="mt-8 border-t border-[#e5eaf0] pt-6">
            <div className="mb-3">
              <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Registrar salida</span>
              <p className="m-0 text-[14px] text-[#64748b]">Descuenta unidades de un repuesto por uso en ordenes de trabajo.</p>
            </div>

            <form className="grid gap-4" onSubmit={bloquearEnvio}>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                  Repuesto utilizado
                  <select
                    className={inputClass}
                    onChange={(evento) => {
                      onActualizarCampo('nombre', evento.target.value);
                    }}
                    value={formulario.nombre}
                  >
                    <option value="">-- Selecciona un repuesto --</option>
                    {items.map((item) => (
                      <option key={item?.id ?? item?.name} value={item?.name || ''}>
                        {item?.name || 'Desconocido'} ({item?.stock || 0} unidades)
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                  Cantidad a descontar
                  <input
                    className={inputClass}
                    onChange={(evento) => onActualizarCampo('cantidad', evento.target.value)}
                    placeholder="Cantidad utilizada"
                    type="number"
                    min="1"
                    value={formulario.cantidad}
                  />
                </label>
              </div>

              {mensaje && <p className="m-0 rounded-[7px] bg-[#eef4f2] p-3 text-[14px] font-bold text-[#0f6b52]">{mensaje}</p>}

              <div className="mt-2 flex justify-end">
                <button className="min-h-10 rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 text-[14px] font-bold text-white hover:bg-[#0c5943] disabled:cursor-not-allowed disabled:opacity-60" disabled={cargando} onClick={onRegistrarSalida} type="button">
                  Registrar salida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMovements && (
        <div id="recent-movements" className="mt-5 border-t border-[#e5eaf0] pt-4">
          <h3 className="m-0 text-[16px] font-extrabold text-[#111827]">Movimientos recientes</h3>
          <div className="mt-2 grid">
            {Array.isArray(movements) && movements.map((movement, index) => (
              <div className={`flex justify-between gap-3.5 py-3 ${index === 0 ? '' : 'border-t border-[#e5eaf0]'}`} key={`${movement?.item}-${movement?.date}-${movement?.type}-${index}`}>
                <div>
                  <strong className="block text-[14px] text-[#111827]">{movement?.item || 'Desconocido'}</strong>
                  <span className="text-[13px] text-[#64748b]">{movement?.date || ''}</span>
                </div>
                <span className={movement?.type === 'Entrada' ? 'text-[14px] font-bold text-[#0f6b52]' : movement?.type === 'Actualizacion' ? 'text-[14px] font-bold text-[#1e55a8]' : 'text-[14px] font-bold text-[#9a4b00]'}>
                  {movement?.type || 'Movimiento'} · {movement?.quantity || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}
