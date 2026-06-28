import { useState, type FormEvent } from 'react';
import type { CrearUsuarioPayload } from '../api/usuariosApi';
import type { UserRole, UsuarioSistema } from '../types';
import { Panel } from './Panel';

type UsersPanelProps = {
  cargandoUsuarios: boolean;
  guardandoUsuario: boolean;
  mensajeUsuarios: string | null;
  onActualizarEstadoUsuario: (
    usuarioId: string,
    activo: boolean,
  ) => Promise<boolean>;
  onCrearUsuario: (usuario: CrearUsuarioPayload) => Promise<boolean>;
  usuarios: UsuarioSistema[];
};

type FormularioUsuario = {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: UserRole;
};

const formularioInicial: FormularioUsuario = {
  nombre: '',
  correo: '',
  contrasena: '',
  rol: 'Recepcionista',
};

const inputClass =
  'min-h-10 rounded-[7px] border border-[#cbd5e1] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0f6b52]';

export function UsersPanel({
  cargandoUsuarios,
  guardandoUsuario,
  mensajeUsuarios,
  onActualizarEstadoUsuario,
  onCrearUsuario,
  usuarios,
}: UsersPanelProps) {
  const [formulario, setFormulario] =
    useState<FormularioUsuario>(formularioInicial);

  function actualizarCampo(campo: keyof FormularioUsuario, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const creado = await onCrearUsuario({
      nombre: formulario.nombre.trim(),
      correo: formulario.correo.trim(),
      contrasena: formulario.contrasena,
      rol: formulario.rol,
    });

    if (creado) {
      setFormulario(formularioInicial);
    }
  }

  return (
    <div className="grid gap-[18px]">
      <Panel>
        <div className="mb-4">
          <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">
            Seguridad
          </span>
          <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">
            Gestionar usuarios
          </h2>
          <p className="m-[6px_0_0] text-[14px] text-[#64748b]">
            Crea cuentas internas y asigna el rol con el que cada usuario puede
            acceder al sistema.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={enviarFormulario}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
              Nombre
              <input
                className={inputClass}
                onChange={(evento) =>
                  actualizarCampo('nombre', evento.target.value)
                }
                required
                type="text"
                value={formulario.nombre}
              />
            </label>

            <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
              Correo
              <input
                className={inputClass}
                onChange={(evento) =>
                  actualizarCampo('correo', evento.target.value)
                }
                required
                type="email"
                value={formulario.correo}
              />
            </label>

            <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
              Contrasena
              <input
                className={inputClass}
                minLength={8}
                onChange={(evento) =>
                  actualizarCampo('contrasena', evento.target.value)
                }
                required
                type="password"
                value={formulario.contrasena}
              />
            </label>

            <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
              Rol
              <select
                className={inputClass}
                onChange={(evento) =>
                  actualizarCampo('rol', evento.target.value as UserRole)
                }
                value={formulario.rol}
              >
                <option value="Administrador">Administrador</option>
                <option value="Recepcionista">Recepcionista</option>
                <option value="Mecanico">Mecanico</option>
                <option value="Inventario">Inventario</option>
              </select>
            </label>
          </div>

          {mensajeUsuarios && (
            <p className="m-0 rounded-[7px] bg-[#eef4f2] p-3 text-[14px] font-bold text-[#0f6b52]">
              {mensajeUsuarios}
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
              disabled={guardandoUsuario}
              type="submit"
            >
              {guardandoUsuario ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </Panel>

      <Panel>
        <div className="mb-4">
          <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">
            Cuentas
          </span>
          <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">
            Usuarios registrados
          </h2>
        </div>

        {cargandoUsuarios ? (
          <p className="m-0 text-[14px] text-[#64748b]">Cargando usuarios...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  {['Nombre', 'Correo', 'Rol', 'Estado', 'Accion'].map(
                    (heading) => (
                      <th
                        className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-left text-[12px] font-extrabold uppercase text-[#516071]"
                        key={heading}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr className="hover:bg-slate-50" key={usuario.id}>
                    <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold text-[#111827]">
                      {usuario.nombre}
                    </td>
                    <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] text-[#334155]">
                      {usuario.correo}
                    </td>
                    <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                      {usuario.rol}
                    </td>
                    <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-extrabold ${
                          usuario.activo
                            ? 'bg-[#dcfce7] text-[#166534]'
                            : 'bg-[#fee2e2] text-[#b91c1c]'
                        }`}
                      >
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                      <button
                        className="rounded-[7px] border border-[#cbd5e1] bg-white px-3 py-1.5 text-[13px] font-bold text-[#1f2937] hover:bg-slate-50"
                        onClick={() =>
                          onActualizarEstadoUsuario(usuario.id, !usuario.activo)
                        }
                        type="button"
                      >
                        {usuario.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}

                {usuarios.length === 0 && (
                  <tr>
                    <td
                      className="border-b border-[#e5eaf0] p-[13px_10px] text-center text-[14px] text-[#64748b]"
                      colSpan={5}
                    >
                      No hay usuarios registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
