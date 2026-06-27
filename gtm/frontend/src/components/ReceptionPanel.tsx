import { useState, type FormEvent } from 'react';
import type { CrearClientePayload } from '../api/clientesApi';
import type { Cliente } from '../types';
import { Panel } from './Panel';

type ReceptionPanelProps = {
  clientes: Cliente[];
  cargandoClientes: boolean;
  errorClientes: string | null;
  guardandoCliente: boolean;
  mensajeFormulario: string | null;
  onCrearCliente: (cliente: CrearClientePayload) => Promise<boolean>;
};

const formularioInicial: CrearClientePayload = {
  rut: '',
  nombre: '',
  telefono: '',
  correo: '',
  esRegular: false,
  porcentajeDescuentoRegular: 0,
  membresia: 'Ninguna',
};

const inputClass =
  'min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]';

export function ReceptionPanel({
  clientes,
  cargandoClientes,
  errorClientes,
  guardandoCliente,
  mensajeFormulario,
  onCrearCliente,
}: ReceptionPanelProps) {
  const [formulario, setFormulario] = useState<CrearClientePayload>(formularioInicial);

  function actualizarCampo(campo: keyof CrearClientePayload, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function actualizarCampoBooleano(campo: keyof CrearClientePayload, valor: boolean) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const clienteGuardado = await onCrearCliente({
      rut: formulario.rut,
      nombre: formulario.nombre,
      telefono: formulario.telefono,
      correo: formulario.correo,
      esRegular: Boolean(formulario.esRegular),
      porcentajeDescuentoRegular: Number(formulario.porcentajeDescuentoRegular || 0),
      membresia: formulario.membresia,
    });

    if (clienteGuardado) {
      setFormulario(formularioInicial);
    }
  }

  return (
    <Panel>
      <div className="mb-4">
        <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Recepcion</span>
        <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Registrar cliente</h2>
        <p className="m-[6px_0_0] text-[14px] text-[#64748b]">El vehiculo se registra aparte y luego se usa al abrir una orden de trabajo.</p>
      </div>

      <form className="grid gap-4" onSubmit={enviarFormulario}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            Nombre cliente
            <input className={inputClass} onChange={(evento) => actualizarCampo('nombre', evento.target.value)} placeholder="Ej: Ana Silva" type="text" value={formulario.nombre} />
          </label>
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            RUT
            <input className={inputClass} onChange={(evento) => actualizarCampo('rut', evento.target.value)} placeholder="Ej: 12.345.678-9" type="text" value={formulario.rut} />
          </label>
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            Telefono
            <input className={inputClass} onChange={(evento) => actualizarCampo('telefono', evento.target.value)} placeholder="+56 9 1234 5678" type="tel" value={formulario.telefono} />
          </label>
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            Correo
            <input className={inputClass} onChange={(evento) => actualizarCampo('correo', evento.target.value)} placeholder="cliente@correo.cl" type="email" value={formulario.correo} />
          </label>
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            Membresia
            <select className={inputClass} onChange={(evento) => actualizarCampo('membresia', evento.target.value)} value={formulario.membresia}>
              <option value="Ninguna">Sin membresia</option>
              <option value="Bronce">Bronce - 10%</option>
              <option value="Plata">Plata - 12.5%</option>
              <option value="Oro">Oro - 15%</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            Descuento cliente regular
            <input
              className={inputClass}
              max="10"
              min="0"
              onChange={(evento) => actualizarCampo('porcentajeDescuentoRegular', evento.target.value)}
              placeholder="0 a 10"
              type="number"
              value={formulario.porcentajeDescuentoRegular}
            />
          </label>
          <label className="flex min-h-10 items-center gap-2 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[13px] font-bold text-[#475569] md:col-span-2">
            <input
              checked={Boolean(formulario.esRegular)}
              onChange={(evento) => actualizarCampoBooleano('esRegular', evento.target.checked)}
              type="checkbox"
            />
            Cliente regular
          </label>
        </div>

        {mensajeFormulario && <p className="m-0 rounded-[7px] bg-[#eef4f2] p-3 text-[14px] font-bold text-[#0f6b52]">{mensajeFormulario}</p>}

        <div className="flex flex-col gap-2 md:flex-row md:justify-end">
          <button className="min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3.5 text-[14px] font-bold text-[#1f2937] hover:bg-slate-50" onClick={() => setFormulario(formularioInicial)} type="button">
            Limpiar
          </button>
          <button className="min-h-10 rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 text-[14px] font-bold text-white hover:bg-[#0c5943] disabled:cursor-not-allowed disabled:opacity-60" disabled={guardandoCliente} type="submit">
            {guardandoCliente ? 'Registrando...' : 'Registrar cliente'}
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
              <div className="text-left text-[13px] font-bold text-[#64748b] md:text-right">
                <span className="block">{cliente.correo}</span>
                <span className="block">
                  {cliente.membresia ?? 'Ninguna'} · Regular: {cliente.esRegular ? `${cliente.porcentajeDescuentoRegular ?? 0}%` : 'No'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
