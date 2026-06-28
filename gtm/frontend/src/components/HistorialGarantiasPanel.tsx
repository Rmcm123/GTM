import { Panel } from './Panel';
import type { WorkOrder } from '../types';

export function HistorialGarantiasPanel({
  ordenes,
  onValidarGarantia,
}: {
  ordenes: WorkOrder[];
  onValidarGarantia: (id: string) => void;
}) {
  const finalizadas = ordenes.filter(
    (o) => o.status === 'Finalizada' || o.status === 'Entregada' || o.status === 'Garantia valida'
  );

  // Sort by date descending
  finalizadas.sort((a, b) => {
    const timeA = a.fechaTermino ? new Date(a.fechaTermino).getTime() : 0;
    const timeB = b.fechaTermino ? new Date(b.fechaTermino).getTime() : 0;
    return timeB - timeA;
  });

  const now = new Date();

  return (
    <section className="grid grid-cols-1 items-start gap-[18px]">
      <Panel>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Historial y Garantias</span>
            <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Trabajos Finalizados</h2>
            <p className="m-[6px_0_0] text-[14px] text-[#64748b]">Revisa el historial de trabajos terminados y valida si aplican a garantia.</p>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                {['Orden', 'Cliente', 'Vehiculo', 'Fecha Termino', 'Estado Garantia', 'Acciones'].map((heading) => (
                  <th className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-left text-[12px] font-extrabold uppercase text-[#516071]" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {finalizadas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border-b border-[#e5eaf0] p-[13px_10px] text-center text-[14px] text-[#64748b]">
                    No hay trabajos finalizados
                  </td>
                </tr>
              ) : (
                finalizadas.map((orden) => {
                  let aptoParaGarantia = false;
                  let fechaTerminoStr = 'No disponible';

                  if (orden.fechaTermino) {
                    const fechaTermino = new Date(orden.fechaTermino);
                    fechaTerminoStr = fechaTermino.toLocaleDateString('es-CL');
                    
                    const diffTime = Math.abs(now.getTime() - fechaTermino.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    // 6 meses aprox = 180 dias
                    aptoParaGarantia = diffDays <= 180;
                  }

                  const esGarantiaValida = orden.status === 'Garantia valida';

                  return (
                    <tr key={orden.id} className="hover:bg-slate-50">
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold text-[#111827]">{orden.id}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{orden.client}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{orden.vehicle}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{fechaTerminoStr}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                        {esGarantiaValida ? (
                          <span className="inline-flex rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[12px] font-extrabold text-[#047857]">Garantia aplicada</span>
                        ) : aptoParaGarantia ? (
                          <span className="inline-flex rounded-full bg-[#f0fdf4] px-2.5 py-1 text-[12px] font-extrabold text-[#166534]">Apto para garantia</span>
                        ) : (
                          <span className="inline-flex rounded-full bg-[#fef2f2] px-2.5 py-1 text-[12px] font-extrabold text-[#991b1b]">No apto para garantia</span>
                        )}
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                        {aptoParaGarantia && !esGarantiaValida ? (
                          <button
                            onClick={() => onValidarGarantia(orden.id)}
                            className="rounded bg-[#0f6872] px-3 py-1.5 text-white hover:bg-[#0d5861] font-medium"
                          >
                            Validar Garantia
                          </button>
                        ) : (
                          <span className="text-[#64748b] text-[13px]">Sin acciones</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  );
}
