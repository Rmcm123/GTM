import { useState, useEffect, type FormEvent } from 'react';
import type { Cliente, Vehiculo } from '../types';
import { crearVehiculo, obtenerVehiculos } from '../api/vehiculoApi';
import { Panel } from './Panel';

type VehiclesPanelProps = {
  clientes: Cliente[];
};

type FormularioVehiculo = {
  rutCliente: string;
  patente: string;
  marca: string;
  modelo: string;
  año: string;
  color: string;
  kilometraje: string;
};

const formularioInicial: FormularioVehiculo = {
  rutCliente: '',
  patente: '',
  marca: '',
  modelo: '',
  año: '',
  color: '',
  kilometraje: '',
};

const inputClass =
  'min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]';

export function VehiclesPanel({ clientes }: VehiclesPanelProps) {
  const [formulario, setFormulario] = useState<FormularioVehiculo>(formularioInicial);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargandoVehiculos, setCargandoVehiculos] = useState(true);

  const clientesFiltrados = clientes.filter((cliente) => {
    const textoBusqueda = busquedaCliente.trim().toLowerCase();

    return textoBusqueda.length > 0 && cliente.rut.toLowerCase().includes(textoBusqueda);
  });

  const cargarVehiculos = async () => {
    try {
      setCargandoVehiculos(true);
      const datos = await obtenerVehiculos();
      setVehiculos(datos);
    } catch (error) {
      console.error('Error cargando vehículos:', error);
    } finally {
      setCargandoVehiculos(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  function actualizarCampo(campo: keyof FormularioVehiculo, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    // Validar que todos los campos requeridos estén completos
    if (
      !formulario.rutCliente ||
      !formulario.patente ||
      !formulario.marca ||
      !formulario.modelo ||
      !formulario.año ||
      !formulario.color ||
      !formulario.kilometraje
    ) {
      setMensaje('Por favor completa todos los campos del formulario.');
      return;
    }

    // Llamar a la API para registrar el vehículo
    crearVehiculo({
      rutCliente: formulario.rutCliente,
      patente: formulario.patente,
      marca: formulario.marca,
      modelo: formulario.modelo,
      año: parseInt(formulario.año, 10),
      color: formulario.color,
      kilometraje: parseInt(formulario.kilometraje, 10),
    })
      .then(() => {
        setMensaje('Vehículo registrado correctamente.');
        setFormulario(formularioInicial);
        cargarVehiculos();
      })
      .catch((error: Error) => {
        setMensaje(`Error: ${error.message}`);
      });
  }

  return (
    <div className="grid gap-[18px]">
      <section className="grid gap-[18px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel>
          <div className="mb-4">
            <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Recepcion</span>
            <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Registrar vehiculo</h2>
            <p className="m-[6px_0_0] text-[14px] text-[#64748b]">
              El vehiculo se asocia a un cliente existente usando su RUT.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={enviarFormulario}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                RUT cliente
                <input
                  className={inputClass}
                  onChange={(evento) => actualizarCampo('rutCliente', evento.target.value)}
                  placeholder="Ej: 12.345.678-9"
                  type="text"
                  value={formulario.rutCliente}
                />
              </label>
              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Patente
                <input
                  className={inputClass}
                  onChange={(evento) => actualizarCampo('patente', evento.target.value)}
                  placeholder="Ej: ABCD-12"
                  type="text"
                  value={formulario.patente}
                />
              </label>
              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Marca
                <input
                  className={inputClass}
                  onChange={(evento) => actualizarCampo('marca', evento.target.value)}
                  placeholder="Ej: Toyota"
                  type="text"
                  value={formulario.marca}
                />
              </label>
              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Modelo
                <input
                  className={inputClass}
                  onChange={(evento) => actualizarCampo('modelo', evento.target.value)}
                  placeholder="Ej: Corolla"
                  type="text"
                  value={formulario.modelo}
                />
              </label>
              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Año
                <input
                  className={inputClass}
                  onChange={(evento) => actualizarCampo('año', evento.target.value)}
                  placeholder="2018"
                  type="number"
                  value={formulario.año}
                />
              </label>
              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
                Kilometraje
                <input
                  className={inputClass}
                  onChange={(evento) => actualizarCampo('kilometraje', evento.target.value)}
                  placeholder="45000"
                  type="number"
                  value={formulario.kilometraje}
                />
              </label>
              <label className="grid gap-1.5 text-[13px] font-bold text-[#475569] md:col-span-2">
                Color
                <input
                  className={inputClass}
                  onChange={(evento) => actualizarCampo('color', evento.target.value)}
                  placeholder="Ej: Blanco"
                  type="text"
                  value={formulario.color}
                />
              </label>
            </div>

            {mensaje && <p className="m-0 rounded-[7px] bg-[#eef4f2] p-3 text-[14px] font-bold text-[#0f6b52]">{mensaje}</p>}

            <div className="flex flex-col gap-2 md:flex-row md:justify-end">
              <button className="min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3.5 text-[14px] font-bold text-[#1f2937] hover:bg-slate-50" onClick={() => setFormulario(formularioInicial)} type="button">
                Limpiar
              </button>
              <button className="min-h-10 rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 text-[14px] font-bold text-white hover:bg-[#0c5943]" type="submit">
                Preparar registro
              </button>
            </div>
          </form>
        </Panel>

        <Panel>
          <div className="mb-3">
            <h3 className="m-0 text-[16px] font-extrabold text-[#111827]">Clientes disponibles</h3>
            <p className="m-[6px_0_0] text-[13px] text-[#64748b]">Usa el RUT de un cliente registrado para asociar el vehiculo.</p>
          </div>

          <label className="mb-2 grid gap-1.5 text-[13px] font-bold text-[#475569]">
            Buscar cliente
            <input
              className={inputClass}
              onChange={(evento) => setBusquedaCliente(evento.target.value)}
              placeholder="Ej: 12.345.678-9"
              type="search"
              value={busquedaCliente}
            />
          </label>

          <div className="grid">
            {!busquedaCliente.trim() && (
              <p className="m-0 rounded-[7px] bg-[#f8fafc] p-3 text-[13px] font-bold text-[#64748b]">Escribe un RUT para buscar clientes registrados.</p>
            )}

            {busquedaCliente.trim() &&
              clientesFiltrados.map((cliente, index) => (
                <button
                  className={`w-full bg-white py-3 text-left hover:bg-slate-50 ${index === 0 ? '' : 'border-t border-[#e5eaf0]'}`}
                  key={cliente.rut}
                  onClick={() => actualizarCampo('rutCliente', cliente.rut)}
                  type="button"
                >
                  <strong className="block text-[14px] text-[#111827]">{cliente.nombre}</strong>
                  <span className="text-[13px] text-[#64748b]">{cliente.rut}</span>
                </button>
              ))}

            {busquedaCliente.trim() && clientesFiltrados.length === 0 && (
              <p className="m-0 rounded-[7px] bg-[#f8fafc] p-3 text-[13px] font-bold text-[#64748b]">No se encontraron clientes con ese RUT.</p>
            )}
          </div>
        </Panel>
      </section>

      <Panel>
        <div className="mb-3">
          <h3 className="m-0 text-[16px] font-extrabold text-[#111827]">Vehículos registrados</h3>
        </div>

        {cargandoVehiculos ? (
          <p className="text-[13px] font-bold text-[#64748b]">Cargando vehículos...</p>
        ) : vehiculos.length === 0 ? (
          <p className="text-[13px] font-bold text-[#64748b]">No hay vehículos registrados aún.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-[12px] font-extrabold uppercase text-[#516071]">RUT Cliente</th>
                  <th className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-[12px] font-extrabold uppercase text-[#516071]">Patente</th>
                  <th className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-[12px] font-extrabold uppercase text-[#516071]">Marca</th>
                  <th className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-[12px] font-extrabold uppercase text-[#516071]">Año</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map((v) => (
                  <tr key={v.id || v.patente} className="border-b border-[#e5eaf0] hover:bg-slate-50">
                    <td className="p-[13px_10px] text-[14px] text-[#64748b]">{v.rutCliente || 'Desconocido'}</td>
                    <td className="p-[13px_10px] text-[14px] font-bold text-[#111827]">{v.patente}</td>
                    <td className="p-[13px_10px] text-[14px] text-[#111827]">{v.marca} {v.modelo}</td>
                    <td className="p-[13px_10px] text-[14px] text-[#111827]">{v.año}</td>
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
