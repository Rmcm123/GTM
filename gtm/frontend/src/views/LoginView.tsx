import { useState } from 'react';
import { iniciarSesion } from '../api/autenticacionApi';
import type { UsuarioSesion } from '../api/sesionApi';

export function LoginView({
  onLogin,
}: {
  onLogin: (usuario: UsuarioSesion) => void;
}) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const sesion = await iniciarSesion({ correo, contrasena });
      onLogin(sesion.usuario);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'No se pudo iniciar sesion',
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#eef2f7] px-4 py-8">
      <section className="grid w-full max-w-[980px] overflow-hidden rounded-xl border border-[#d8e0ea] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col justify-between gap-8 bg-[#17211f] p-7 text-white sm:p-9">
          <div>
            <span className="mb-5 inline-grid h-12 w-12 place-items-center rounded-lg bg-[#f4c95d] text-[18px] font-extrabold text-[#17211f]">
              GTM
            </span>
            <h1 className="m-0 max-w-[520px] text-[34px] font-black leading-tight sm:text-[42px]">
              Sistema de gestion de taller mecanico
            </h1>
            <p className="mt-4 max-w-[520px] text-[15px] leading-6 text-[#c8d5cf]">
              Acceso por roles para administrar clientes, vehiculos, ordenes de
              trabajo e inventario desde una sola plataforma.
            </p>
          </div>
          <div className="grid gap-2 text-[13px] text-[#c8d5cf]">
            <span className="font-bold uppercase text-[#f4c95d]">
              Operacion del taller
            </span>
            <span>Gestiona recepcion, ordenes, pagos e inventario.</span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-[12px] font-extrabold uppercase text-[#64748b]">
              Iniciar sesion
            </span>
            <h2 className="m-0 mt-1 text-[24px] font-black text-[#111827]">
              Acceso al sistema
            </h2>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-1.5 text-[14px] font-bold text-[#334155]">
              Correo
              <input
                className="min-h-11 rounded-lg border border-[#cbd5e1] px-3 text-[15px] font-medium text-[#111827] outline-none focus:border-[#0f6872] focus:ring-2 focus:ring-[#0f6872]/20"
                onChange={(event) => setCorreo(event.target.value)}
                type="email"
                value={correo}
              />
            </label>

            <label className="grid gap-1.5 text-[14px] font-bold text-[#334155]">
              Contrasena
              <input
                className="min-h-11 rounded-lg border border-[#cbd5e1] px-3 text-[15px] font-medium text-[#111827] outline-none focus:border-[#0f6872] focus:ring-2 focus:ring-[#0f6872]/20"
                onChange={(event) => setContrasena(event.target.value)}
                type="password"
                value={contrasena}
              />
            </label>

            {error && (
              <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[14px] font-bold text-[#b91c1c]">
                {error}
              </div>
            )}

            <button
              className="min-h-11 rounded-lg bg-[#0f6872] px-4 text-[15px] font-extrabold text-white transition-colors hover:bg-[#0c5860] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={cargando}
              type="submit"
            >
              {cargando ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
