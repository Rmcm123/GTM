import type { Cliente } from '../types';
import { Panel } from './Panel';

type ReceptionPanelProps = {
  clientes: Cliente[];
  cargandoClientes: boolean;
  errorClientes: string | null;
};

const inputClass =
  'min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]';

export function ReceptionPanel({ clientes, cargandoClientes, errorClientes }: ReceptionPanelProps) {
  return (
    <Panel>
      <div className="mb-4">
        <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Recepcion</span>
        <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Registrar cliente y vehiculo</h2>
        <p className="m-[6px_0_0] text-[14px] text-[#64748b]">Primer paso antes de abrir una orden de trabajo.</p>
      </div>

      <form className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            Nombre cliente
            <input className={inputClass} placeholder="Ej: Ana Silva" type="text" />
          </label>
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            RUT
            <input className={inputClass} placeholder="Ej: 12.345.678-9" type="text" />
          </label>
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            Telefono
            <input className={inputClass} placeholder="+56 9 1234 5678" type="tel" />
          </label>
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            Correo
            <input className={inputClass} placeholder="cliente@correo.cl" type="email" />
          </label>
        </div>

        <div className="grid gap-3 border-t border-[#e5eaf0] pt-4 md:grid-cols-3">
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            Patente
            <input className={inputClass} placeholder="ABCD-12" type="text" />
          </label>
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            Marca y modelo
            <input className={inputClass} placeholder="Toyota Corolla" type="text" />
          </label>
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            Ano
            <input className={inputClass} placeholder="2018" type="number" />
          </label>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:justify-end">
          <button className="min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3.5 text-[14px] font-bold text-[#1f2937] hover:bg-slate-50" type="button">
            Limpiar
          </button>
          <button className="min-h-10 rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 text-[14px] font-bold text-white hover:bg-[#0c5943]" type="button">
            Registrar y abrir OT
          </button>
        </div>
      </form>

      <div className="mt-5 border-t border-[#e5eaf0] pt-4">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <h3 className="m-0 text-[16px] font-extrabold text-[#111827]">Clientes recientes</h3>
          {cargandoClientes && <span className="text-[13px] font-bold text-[#64748b]">Cargando desde backend...</span>}
          {errorClientes && <span className="text-[13px] font-bold text-[#9a4b00]">{errorClientes}</span>}
        </div>

        <div className="mt-2 grid">
          {clientes.map((cliente, index) => (
            <div className={`flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between ${index === 0 ? '' : 'border-t border-[#e5eaf0]'}`} key={cliente.rut}>
              <div>
                <strong className="block text-[14px] text-[#111827]">{cliente.nombre}</strong>
                <span className="text-[13px] text-[#64748b]">{cliente.rut} - {cliente.telefono}</span>
              </div>
              <div className="text-left md:text-right">
                <strong className="block text-[14px] text-[#111827]">{cliente.patenteVehiculo}</strong>
                <span className="text-[13px] text-[#64748b]">{cliente.vehiculo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
