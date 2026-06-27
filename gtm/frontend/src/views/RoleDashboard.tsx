import type {
  ActualizarClientePayload,
  CrearClientePayload,
} from '../api/clientesApi';
import type { CrearOrdenTrabajoPayload } from '../api/ordenesTrabajoApi';
import type { RegistrarPagoPayload } from '../api/pagosApi';
import type { CrearUsuarioPayload } from '../api/usuariosApi';
import type {
  AlertaStockBajo,
  Cliente,
  InventarioFormulario,
  InventoryItem,
  RepuestoSolicitado,
  StockMovement,
  UserRole,
  UsuarioSistema,
  WorkOrder,
} from '../types';
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
  guardandoClienteActualizado,
  guardandoOrden,
  guardandoPago,
  guardandoUsuario,
  mensajeFormulario,
  mensajeOrden,
  mensajePago,
  mensajeEstadoOrden,
  mensajeUsuarios,
  onCrearCliente,
  onActualizarCliente,
  onCrearOrden,
  onEntregarOrden,
  onRegistrarPago,
  onCrearUsuario,
  onActualizarEstadoUsuario,
  ordenes,
  cargandoInventario,
  cargandoUsuarios,
  usuarios,
  mecanicos,
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
  nombreUsuario,
}: {
  activeSection: string;
  cargandoClientes: boolean;
  clientes: Cliente[];
  errorClientes: string | null;
  guardandoCliente: boolean;
  guardandoClienteActualizado?: boolean;
  guardandoOrden: boolean;
  guardandoPago: boolean;
  guardandoUsuario: boolean;
  mensajeFormulario: string | null;
  mensajeOrden: string | null;
  mensajePago: string | null;
  mensajeEstadoOrden: string | null;
  mensajeUsuarios: string | null;
  onCrearCliente: (cliente: CrearClientePayload) => Promise<boolean>;
  onActualizarCliente?: (
    rut: string,
    cliente: ActualizarClientePayload,
  ) => Promise<boolean>;
  onCrearOrden: (orden: CrearOrdenTrabajoPayload) => Promise<boolean>;
  onEntregarOrden: (ordenId: string) => Promise<void>;
  onRegistrarPago: (pago: RegistrarPagoPayload) => Promise<boolean>;
  onCrearUsuario: (usuario: CrearUsuarioPayload) => Promise<boolean>;
  onActualizarEstadoUsuario: (
    usuarioId: string,
    activo: boolean,
  ) => Promise<boolean>;
  ordenes: WorkOrder[];
  cargandoInventario: boolean;
  cargandoUsuarios: boolean;
  usuarios: UsuarioSistema[];
  mecanicos: UsuarioSistema[];
  inventario: InventoryItem[];
  alertasStockBajo: AlertaStockBajo[];
  movimientosInventario: StockMovement[];
  mensajeInventario: string | null;
  formularioInventario: InventarioFormulario;
  onActualizarCampoInventario: (
    campo: keyof InventarioFormulario,
    valor: string,
  ) => void;
  onActualizarStockInventario: () => Promise<void>;
  onRegistrarEntradaInventario: () => Promise<void>;
  onRegistrarSalidaInventario: () => Promise<void>;
  onIrAMovimientos: (target?: 'top' | 'entry' | 'exit' | 'recent') => void;
  onIrAStockBajo: () => void;
  ordenesTrabajo: WorkOrder[];
  repuestosSolicitados: RepuestoSolicitado[];
  onActualizarEstadoOT: (id: string, estado: WorkOrder['status']) => void;
  onSolicitarRepuesto: (
    nombre: string,
    cantidad: number,
    mecanico: string,
    ordenTrabajo: string,
    observaciones?: string,
  ) => Promise<boolean>;
  onNavigate: (section: string) => void;
  role: UserRole;
  nombreUsuario: string;
}) {
  if (role === 'Recepcionista') {
    return (
      <ReceptionView
        activeSection={activeSection}
        cargandoClientes={cargandoClientes}
        clientes={clientes}
        errorClientes={errorClientes}
        guardandoCliente={guardandoCliente}
        guardandoPago={guardandoPago}
        guardandoOrden={guardandoOrden}
        inventario={inventario}
        mecanicos={mecanicos}
        mensajeFormulario={mensajeFormulario}
        mensajeOrden={mensajeOrden}
        mensajePago={mensajePago}
        onCrearCliente={onCrearCliente}
        onCrearOrden={onCrearOrden}
        onEntregarOrden={onEntregarOrden}
        onRegistrarPago={onRegistrarPago}
        ordenes={ordenes}
        onNavigate={onNavigate}
      />
    );
  }

  if (role === 'Mecanico') {
    return (
      <MechanicView
        activeSection={activeSection}
        inventario={inventario}
        mensajeEstadoOrden={mensajeEstadoOrden}
        nombreUsuario={nombreUsuario}
        ordenes={ordenesTrabajo}
        onActualizarEstado={onActualizarEstadoOT}
        onSolicitarRepuesto={onSolicitarRepuesto}
      />
    );
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

  return (
    <AdminView
      activeSection={activeSection}
      ordenes={ordenesTrabajo}
      repuestosSolicitados={repuestosSolicitados}
      clientes={clientes}
      inventario={inventario}
      alertasStockBajo={alertasStockBajo}
      onNavigate={onNavigate}
      onActualizarCliente={onActualizarCliente}
      guardandoClienteActualizado={guardandoClienteActualizado}
      mensajeFormulario={mensajeFormulario}
      cargandoUsuarios={cargandoUsuarios}
      guardandoUsuario={guardandoUsuario}
      mensajeUsuarios={mensajeUsuarios}
      onActualizarEstadoUsuario={onActualizarEstadoUsuario}
      onCrearUsuario={onCrearUsuario}
      usuarios={usuarios}
    />
  );
}
