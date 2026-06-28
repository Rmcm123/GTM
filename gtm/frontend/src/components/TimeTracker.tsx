import { useEffect, useState } from 'react';
import {
  detenerTiempoTrabajo,
  iniciarTiempoTrabajo,
  obtenerHistorialTiempos,
} from '../api/ordenesTrabajoApi';
import type { HistorialTiemposResponse } from '../types';

export function TimeTracker({
  ordenId,
}: {
  ordenId: string;
}) {
  const [historialResponse, setHistorialResponse] = useState<HistorialTiemposResponse | null>(null);
  const [estaTrabajando, setEstaTrabajando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Extraer el numero de la orden "OT-001" -> 1
  const idNumerico = parseInt(ordenId.replace(/\D/g, ''), 10);

  const cargarHistorial = async () => {
    try {
      const data = await obtenerHistorialTiempos(idNumerico);
      setHistorialResponse(data);
      const tareaActiva = data.historial.find((h) => !h.fechaFin);
      setEstaTrabajando(!!tareaActiva);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordenId]);

  const handleIniciar = async () => {
    try {
      await iniciarTiempoTrabajo(idNumerico, 'Trabajo en taller');
      setMensaje('Tarea iniciada exitosamente.');
      setTimeout(() => setMensaje(null), 3000);
      cargarHistorial();
    } catch (error: any) {
      setMensaje(error.message || 'Error al iniciar tarea');
      setTimeout(() => setMensaje(null), 4000);
    }
  };

  const handleDetener = async () => {
    try {
      await detenerTiempoTrabajo(idNumerico);
      setMensaje('Tarea detenida exitosamente.');
      setTimeout(() => setMensaje(null), 3000);
      cargarHistorial();
    } catch (error: any) {
      setMensaje(error.message || 'Error al detener tarea');
      setTimeout(() => setMensaje(null), 4000);
    }
  };

  return (
    <div className="rounded-lg border border-[#e5eaf0] bg-[#f8fafc] p-4 mt-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-extrabold text-[#111827]">Registro de Tiempos</h3>
          <p className="text-[12px] text-[#64748b]">
            Total invertido:{' '}
            <strong className="text-[#0f6b52]">
              {historialResponse?.tiempoTotalMinutos || 0} min
            </strong>
          </p>
        </div>
        <div>
          {estaTrabajando ? (
            <button
              onClick={handleDetener}
              className="flex items-center gap-2 rounded-[7px] border border-[#991b1b] bg-[#b91c1c] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#991b1b] transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-200"></span>
              </span>
              Detener Tarea
            </button>
          ) : (
            <button
              onClick={handleIniciar}
              className="rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#0c5943] transition-colors"
            >
              ▶ Iniciar Tarea
            </button>
          )}
        </div>
      </div>

      {mensaje && (
        <div className={`mb-3 rounded-[7px] p-2 text-[13px] font-bold ${mensaje.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-[#eef4f2] text-[#0f6b52]'}`}>
          {mensaje}
        </div>
      )}

      {historialResponse && historialResponse.historial.length > 0 && (
        <div className="mt-3">
          <h4 className="text-[12px] font-bold uppercase text-[#64748b] mb-2">Historial de sesiones</h4>
          <div className="max-h-32 overflow-y-auto pr-2">
            <table className="w-full text-left text-[12px] text-[#475569]">
              <thead>
                <tr className="border-b border-[#e5eaf0]">
                  <th className="pb-1 font-bold">Fecha</th>
                  <th className="pb-1 font-bold">Inicio - Fin</th>
                  <th className="pb-1 font-bold text-right">Duración</th>
                </tr>
              </thead>
              <tbody>
                {historialResponse.historial.map((reg) => (
                  <tr key={reg.id} className="border-b border-[#e5eaf0] last:border-0">
                    <td className="py-1.5">{new Date(reg.fechaInicio).toLocaleDateString()}</td>
                    <td className="py-1.5">
                      {new Date(reg.fechaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {reg.fechaFin ? new Date(reg.fechaFin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Actual'}
                    </td>
                    <td className="py-1.5 text-right font-bold">
                      {reg.fechaFin ? `${reg.minutosTrabajados} min` : 'En curso'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
