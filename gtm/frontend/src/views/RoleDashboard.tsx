import type { CrearClientePayload } from '../api/clientesApi';
import type { CrearOrdenTrabajoPayload } from '../api/ordenesTrabajoApi';
import type { AlertaStockBajo, Cliente, InventarioFormulario, InventoryItem, RepuestoSolicitado, StockMovement, UserRole, WorkOrder } from '../types';
import { AdminView } from './AdminView';
import { InventoryView } from './InventoryView';
import { MechanicView } from './MechanicView';
import { ReceptionView } from './ReceptionView';

export function RoleDashboard({
  activeSection,
  cargandoClientes,
  clientes,
  errorClientes,
  guardandoCliente,
  guardandoOrden,
  mensajeFormulario,
  mensajeOrden,
  onCrearCliente,
  onCrearOrden,
  ordenes,
  cargandoInventario,
  inventario,
  alertasStockBajo,
  movimientosInventario,
  mensajeInventario,
  formularioInventario,
  onActualizarCampoInventario,
  onActualizarStockInventario,
  onRegistrarEntradaInventario,
  onRegistrarSalidaInventario,
  onIrAMovimientos,
  onIrAStockBajo,
  ordenesTrabajo,
  repuestosSolicitados,
  onActualizarEstadoOT,
  onSolicitarRepuesto,
  onNavigate,
  role,
}: {
  activeSection: string;
  cargandoClientes: boolean;
  clientes: Cliente[];
  errorClientes: string | null;
  guardandoCliente: boolean;
  guardandoOrden: boolean;
  mensajeFormulario: string | null;
  mensajeOrden: string | null;
  onCrearCliente: (cliente: CrearClientePayload) => Promise<boolean>;
  onCrearOrden: (orden: CrearOrdenTrabajoPayload) => Promise<boolean>;
  ordenes: WorkOrder[];
  cargandoInventario: boolean;
  inventario: InventoryItem[];
  alertasStockBajo: AlertaStockBajo[];
  movimientosInventario: StockMovement[];
  mensajeInventario: string | null;
  formularioInventario: InventarioFormulario;
  onActualizarCampoInventario: (campo: keyof InventarioFormulario, valor: string) => void;
  onActualizarStockInventario: () => Promise<void>;
  onRegistrarEntradaInventario: () => Promise<void>;
  onRegistrarSalidaInventario: () => Promise<void>;
  onIrAMovimientos: (target?: 'top' | 'entry' | 'exit' | 'recent') => void;
  onIrAStockBajo: () => void;
  ordenesTrabajo: WorkOrder[];
  repuestosSolicitados: RepuestoSolicitado[];
  onActualizarEstadoOT: (id: string, estado: WorkOrder['status']) => void;
  onSolicitarRepuesto: (nombre: string, cantidad: number, mecanico: string, ordenTrabajo: string, observaciones?: string) => void;
  onNavigate: (section: string) => void;
  role: UserRole;
}) {
  if (role === 'Recepcionista') {
    return (
      <ReceptionView
        activeSection={activeSection}
        cargandoClientes={cargandoClientes}
        clientes={clientes}
        errorClientes={errorClientes}
        guardandoCliente={guardandoCliente}
        guardandoOrden={guardandoOrden}
        mensajeFormulario={mensajeFormulario}
        mensajeOrden={mensajeOrden}
        onCrearCliente={onCrearCliente}
        onCrearOrden={onCrearOrden}
        ordenes={ordenes}
        onNavigate={onNavigate}
      />
    );
  }

  if (role === 'Mecanico') {
    return <MechanicView activeSection={activeSection} ordenes={ordenesTrabajo} onActualizarEstado={onActualizarEstadoOT} onSolicitarRepuesto={onSolicitarRepuesto} />;
  }

  if (role === 'Inventario') {
    return (
      <InventoryView
        activeSection={activeSection}
        cargandoInventario={cargandoInventario}
        formularioInventario={formularioInventario}
        inventario={inventario}
        mensajeInventario={mensajeInventario}
        movimientosInventario={movimientosInventario}
        repuestosSolicitados={repuestosSolicitados}
        onActualizarCampoInventario={onActualizarCampoInventario}
        onActualizarStockInventario={onActualizarStockInventario}
        onRegistrarEntradaInventario={onRegistrarEntradaInventario}
        onRegistrarSalidaInventario={onRegistrarSalidaInventario}
        onIrAMovimientos={onIrAMovimientos}
        onIrAStockBajo={onIrAStockBajo}
      />
    );
  }

  return <AdminView activeSection={activeSection} ordenes={ordenesTrabajo} repuestosSolicitados={repuestosSolicitados} clientes={clientes} inventario={inventario} alertasStockBajo={alertasStockBajo} onNavigate={onNavigate} />;
}
