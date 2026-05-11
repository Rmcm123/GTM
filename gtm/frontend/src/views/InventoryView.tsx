import { ActionPanel } from '../components/ActionPanel';
import { InventoryPanel } from '../components/InventoryPanel';
import { Panel } from '../components/Panel';
import { SummaryCards } from '../components/SummaryCards';
import { inventorySummary, roleConfig } from '../data/mockData';
import type { InventarioFormulario, InventoryItem, RepuestoSolicitado, StockMovement } from '../types';

export function InventoryView({
  activeSection,
  cargandoInventario,
  inventario,
  movimientosInventario,
  repuestosSolicitados,
  mensajeInventario,
  formularioInventario,
  onActualizarCampoInventario,
  onActualizarStockInventario,
  onRegistrarEntradaInventario,
  onRegistrarSalidaInventario,
  onIrAMovimientos,
  onIrAStockBajo,
}: {
  activeSection: string;
  cargandoInventario: boolean;
  inventario: InventoryItem[];
  movimientosInventario: StockMovement[];
  repuestosSolicitados: RepuestoSolicitado[];
  mensajeInventario: string | null;
  formularioInventario: InventarioFormulario;
  onActualizarCampoInventario: (campo: keyof InventarioFormulario, valor: string) => void;
  onActualizarStockInventario: () => Promise<void>;
  onRegistrarEntradaInventario: () => Promise<void>;
  onRegistrarSalidaInventario: () => Promise<void>;
  onIrAMovimientos: (target?: 'top' | 'entry' | 'exit' | 'recent') => void;
  onIrAStockBajo: () => void;
}) {
  const soloMovimientos = activeSection === 'Movimientos';
  const esStockBajo = activeSection === 'Stock bajo';
  const esRepuestosSolicitados = activeSection === 'Repuestos solicitados';

  // Nos aseguramos de que el inventario sea un arreglo válido, aunque la API falle o traiga mal formato
  const inventarioSeguro = Array.isArray(inventario) ? inventario : [];
  const itemsAMostrar = esStockBajo
    ? inventarioSeguro.filter((item) => (item?.stock || 0) < (item?.minimum || 0))
    : inventarioSeguro;

  if (esRepuestosSolicitados) {
    return (
      <>
        <SummaryCards cards={inventorySummary} />
        <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <Panel>
            <div className="mb-3">
              <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">Inventario</span>
              <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">Repuestos solicitados</h2>
              <p className="m-[6px_0_0] text-[13px] text-[#64748b]">Listado de repuestos solicitados por mecanicos para reparaciones.</p>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr>
                    {['Repuesto', 'Cantidad', 'Mecanico', 'Orden de Trabajo', 'Fecha', 'Observaciones'].map((heading) => (
                      <th className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-left text-[12px] font-extrabold uppercase text-[#516071]" key={heading}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {repuestosSolicitados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border-b border-[#e5eaf0] p-[13px_10px] text-center text-[14px] text-[#64748b]">
                        No hay repuestos solicitados
                      </td>
                    </tr>
                  ) : (
                    repuestosSolicitados.map((repuesto) => (
                      <tr key={repuesto.id} className="hover:bg-slate-50">
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold text-[#111827]">{repuesto.nombre}</td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{repuesto.cantidad}</td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{repuesto.mecanico}</td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold">{repuesto.ordenTrabajo}</td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{repuesto.fecha}</td>
                        <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">{repuesto.observaciones || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
          <ActionPanel
            actions={roleConfig.Inventario.actions}
            onAction={(action) => {
              if (action === 'Reponer repuesto') {
                onIrAMovimientos('entry');
              } else if (action === 'Registrar salida') {
                onIrAMovimientos('exit');
              } else if (action === 'Revisar stock bajo') {
                onIrAStockBajo();
              } else if (action === 'Crear repuesto') {
                onIrAMovimientos('top');
              }
            }}
          />
        </section>
      </>
    );
  }

  return (
    <>
      <SummaryCards cards={inventorySummary} />
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <InventoryPanel
          cargando={cargandoInventario}
          formulario={soloMovimientos ? formularioInventario : undefined}
          items={itemsAMostrar}
          title={esRepuestosSolicitados ? 'Repuestos solicitados' : esStockBajo ? 'Repuestos con stock bajo' : 'Stock de repuestos'}
          mensaje={mensajeInventario}
          movements={movimientosInventario}
          onActualizarCampo={soloMovimientos ? onActualizarCampoInventario : undefined}
          onActualizarStock={soloMovimientos ? onActualizarStockInventario : undefined}
          onRegistrarEntrada={soloMovimientos ? onRegistrarEntradaInventario : undefined}
          onRegistrarSalida={soloMovimientos ? onRegistrarSalidaInventario : undefined}
          showMovements={soloMovimientos}
          showStockList={!soloMovimientos}
        />
        <ActionPanel
          actions={roleConfig.Inventario.actions}
          onAction={(action) => {
            if (action === 'Reponer repuesto') {
              onIrAMovimientos('entry');
            } else if (action === 'Registrar salida') {
              onIrAMovimientos('exit');
            } else if (action === 'Revisar stock bajo') {
              onIrAStockBajo();
            } else if (action === 'Crear repuesto') {
              onIrAMovimientos('top');
            }
          }}
        />
      </section>
    </>
  );
}
