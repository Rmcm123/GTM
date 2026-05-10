import { useEffect, useState } from 'react';
import { ActionPanel } from './components/ActionPanel';
import { AppLayout } from './components/AppLayout';
import { CapacityPanel } from './components/CapacityPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { OrdersTable } from './components/OrdersTable';
import { ReceptionPanel } from './components/ReceptionPanel';
import { SummaryCards } from './components/SummaryCards';
import { VehiclesPanel } from './components/VehiclesPanel';
import { WorkOrdersPanel } from './components/WorkOrdersPanel';
import { WorkflowPanel } from './components/WorkflowPanel';
import { crearCliente, obtenerClientes, type CrearClientePayload } from './api/clientesApi';
import { crearOrdenTrabajo, obtenerOrdenesTrabajo, type CrearOrdenTrabajoPayload } from './api/ordenesTrabajoApi';
import {
  actualizarStockInventario,
  obtenerInventario,
  obtenerMovimientosInventario,
  registrarEntradaInventario,
  type ActualizarStockPayload,
  type RegistrarEntradaPayload,
} from './api/inventarioApi';
import {
  adminSummary,
  clientes as clientesMock,
  inventoryItems,
  inventorySummary,
  mechanicSummary,
  receptionSummary,
  roleConfig,
  stockMovements,
  workOrders,
  workflow,
} from './data/mockData';
import type { Cliente, InventoryItem, StockMovement, UserRole, WorkOrder } from './types';

type InventarioFormulario = {
  nombre: string;
  categoria: string;
  minimo: string;
  stock: string;
  cantidad: string;
  nota: string;
};

const formularioInventarioInicial: InventarioFormulario = {
  nombre: '',
  categoria: '',
  minimo: '',
  stock: '',
  cantidad: '',
  nota: '',
};

function Header({
  title,
  description,
  secondaryAction,
  primaryAction,
  onPrimaryAction,
  onSecondaryAction,
}: {
  title: string;
  description: string;
  secondaryAction: string;
  primaryAction: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}) {
  return (
    <header className="mb-[22px] flex flex-col items-start justify-between gap-5 md:flex-row">
      <div>
        <span className="mb-1.5 inline-block text-[12px] font-bold uppercase tracking-wide text-[#64748b]">Panel principal</span>
        <h1 className="m-0 text-[26px] font-extrabold leading-[1.15] text-[#111827] md:text-[32px]">{title}</h1>
        <p className="m-[8px_0_0] text-[14px] text-[#64748b]">{description}</p>
      </div>
      <div className="flex w-full flex-col items-center justify-end gap-2.5 md:w-auto md:flex-row">
        <button className="min-h-10 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-3.5 text-[14px] font-bold text-[#1f2937] hover:bg-slate-50 md:w-auto" onClick={onSecondaryAction} type="button">
          {secondaryAction}
        </button>
        <button className="min-h-10 w-full rounded-[7px] border border-[#0f5b46] bg-[#0f6b52] px-3.5 text-[14px] font-bold text-white hover:bg-[#0c5943] md:w-auto" onClick={onPrimaryAction} type="button">
          {primaryAction}
        </button>
      </div>
    </header>
  );
}

function AdminView() {
  return (
    <>
      <SummaryCards cards={adminSummary} />
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <OrdersTable title="Ordenes activas" helper="Todas las ordenes visibles para control general." orders={workOrders} />
        <div className="grid gap-[18px]">
          <CapacityPanel occupiedSlots={3} totalSlots={5} />
          <WorkflowPanel items={workflow} />
        </div>
      </section>
      <section className="mt-[18px] grid grid-cols-1 gap-[18px] xl:grid-cols-[minmax(280px,1fr)_320px]">
        <InventoryPanel items={inventoryItems} />
        <ActionPanel actions={roleConfig.Administrador.actions} />
      </section>
    </>
  );
}

function ReceptionDashboard() {
  const receptionOrders = workOrders.filter((order) => order.status === 'Pendiente' || order.status === 'En revision');

  return (
    <>
      <SummaryCards cards={receptionSummary} />
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <OrdersTable title="Ordenes por ingresar o revisar" helper="Ordenes que recepcion debe coordinar con clientes y mecanicos." orders={receptionOrders} actionLabel="Abrir OT" />
        <div className="grid gap-[18px]">
          <CapacityPanel occupiedSlots={3} totalSlots={5} />
          <ActionPanel actions={roleConfig.Recepcionista.actions} />
        </div>
      </section>
    </>
  );
}

function ReceptionView({
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
}) {
  if (activeSection === 'Clientes') {
    return (
      <ReceptionPanel
        cargandoClientes={cargandoClientes}
        clientes={clientes}
        errorClientes={errorClientes}
        guardandoCliente={guardandoCliente}
        mensajeFormulario={mensajeFormulario}
        onCrearCliente={onCrearCliente}
      />
    );
  }

  if (activeSection === 'Vehiculos') {
    return <VehiclesPanel clientes={clientes} />;
  }

  if (activeSection === 'Ordenes') {
    return <WorkOrdersPanel clientes={clientes} guardandoOrden={guardandoOrden} mensajeOrden={mensajeOrden} onCrearOrden={onCrearOrden} ordenes={ordenes} />;
  }

  return <ReceptionDashboard />;
}

function MechanicView() {
  const mechanicOrders = workOrders.filter((order) => order.mechanic === 'Camila Torres');

  return (
    <>
      <SummaryCards cards={mechanicSummary} />
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <OrdersTable title="Mis ordenes asignadas" helper="Trabajos que el mecanico debe revisar o actualizar." orders={mechanicOrders} actionLabel="Ver detalle" />
        <ActionPanel actions={roleConfig.Mecanico.actions} />
      </section>
    </>
  );
}

function InventoryView({
  activeSection,
  cargandoInventario,
  inventario,
  movimientosInventario,
  mensajeInventario,
  formularioInventario,
  onActualizarCampoInventario,
  onActualizarStockInventario,
  onRegistrarEntradaInventario,
  onIrAMovimientos,
  onIrAStockBajo,
}: {
  activeSection: string;
  cargandoInventario: boolean;
  inventario: InventoryItem[];
  movimientosInventario: StockMovement[];
  mensajeInventario: string | null;
  formularioInventario: InventarioFormulario;
  onActualizarCampoInventario: (campo: keyof InventarioFormulario, valor: string) => void;
  onActualizarStockInventario: () => Promise<void>;
  onRegistrarEntradaInventario: () => Promise<void>;
  onIrAMovimientos: (target?: 'top' | 'entry' | 'recent') => void;
  onIrAStockBajo: () => void;
}) {
  const soloMovimientos = activeSection === 'Movimientos';
  const esStockBajo = activeSection === 'Stock bajo';

  // Nos aseguramos de que el inventario sea un arreglo válido, aunque la API falle o traiga mal formato
  const inventarioSeguro = Array.isArray(inventario) ? inventario : [];
  const itemsAMostrar = esStockBajo
    ? inventarioSeguro.filter((item) => (item?.stock || 0) < (item?.minimum || 0))
    : inventarioSeguro;

  return (
    <>
      <SummaryCards cards={inventorySummary} />
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <InventoryPanel
          cargando={cargandoInventario}
          formulario={soloMovimientos ? formularioInventario : undefined}
          items={itemsAMostrar}
          title={esStockBajo ? 'Repuestos con stock bajo' : 'Stock de repuestos'}
          mensaje={mensajeInventario}
          movements={movimientosInventario}
          onActualizarCampo={soloMovimientos ? onActualizarCampoInventario : undefined}
          onActualizarStock={soloMovimientos ? onActualizarStockInventario : undefined}
          onRegistrarEntrada={soloMovimientos ? onRegistrarEntradaInventario : undefined}
          showMovements={soloMovimientos}
          showStockList={!soloMovimientos}
        />
        <ActionPanel
          actions={roleConfig.Inventario.actions}
          onAction={(action) => {
            if (action === 'Registrar entrada') {
              onIrAMovimientos('entry');
            } else if (action === 'Registrar salida') {
              onIrAMovimientos('recent');
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

function RoleDashboard({
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
  movimientosInventario,
  mensajeInventario,
  formularioInventario,
  onActualizarCampoInventario,
  onActualizarStockInventario,
  onRegistrarEntradaInventario,
  onIrAMovimientos,
  onIrAStockBajo,
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
  movimientosInventario: StockMovement[];
  mensajeInventario: string | null;
  formularioInventario: InventarioFormulario;
  onActualizarCampoInventario: (campo: keyof InventarioFormulario, valor: string) => void;
  onActualizarStockInventario: () => Promise<void>;
  onRegistrarEntradaInventario: () => Promise<void>;
  onIrAMovimientos: (target?: 'top' | 'entry' | 'recent') => void;
  onIrAStockBajo: () => void;
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
      />
    );
  }

  if (role === 'Mecanico') {
    return <MechanicView />;
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
        onActualizarCampoInventario={onActualizarCampoInventario}
        onActualizarStockInventario={onActualizarStockInventario}
        onRegistrarEntradaInventario={onRegistrarEntradaInventario}
        onIrAMovimientos={onIrAMovimientos}
        onIrAStockBajo={onIrAStockBajo}
      />
    );
  }

  return <AdminView />;
}

function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('Administrador');
  const currentRole = roleConfig[activeRole];
  const [activeSection, setActiveSection] = useState(currentRole.navItems[0]);
  const [clientes, setClientes] = useState<Cliente[]>(clientesMock);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [errorClientes, setErrorClientes] = useState<string | null>(null);
  const [guardandoCliente, setGuardandoCliente] = useState(false);
  const [guardandoOrden, setGuardandoOrden] = useState(false);
  const [mensajeFormulario, setMensajeFormulario] = useState<string | null>(null);
  const [mensajeOrden, setMensajeOrden] = useState<string | null>(null);
  const [ordenes, setOrdenes] = useState<WorkOrder[]>(workOrders);
  const [inventario, setInventario] = useState<InventoryItem[]>(inventoryItems);
  const [movimientosInventario, setMovimientosInventario] = useState<StockMovement[]>(stockMovements);
  const [cargandoInventario, setCargandoInventario] = useState(false);
  const [mensajeInventario, setMensajeInventario] = useState<string | null>(null);
  const [formularioInventario, setFormularioInventario] = useState<InventarioFormulario>(formularioInventarioInicial);

  useEffect(() => {
    async function cargarClientes() {
      setCargandoClientes(true);
      setErrorClientes(null);

      try {
        const clientesDesdeApi = await obtenerClientes();
        setClientes(clientesDesdeApi);
      } catch {
        // Si el backend no esta levantado, la pantalla sigue siendo usable con datos locales.
        setClientes(clientesMock);
        setErrorClientes('Mostrando datos locales');
      } finally {
        setCargandoClientes(false);
      }
    }

    void cargarClientes();
  }, []);

  useEffect(() => {
    async function cargarOrdenes() {
      try {
        const ordenesDesdeApi = await obtenerOrdenesTrabajo();
        setOrdenes(ordenesDesdeApi);
      } catch {
        setOrdenes(workOrders);
      }
    }

    void cargarOrdenes();
  }, []);

  useEffect(() => {
    async function cargarInventario() {
      setCargandoInventario(true);

      try {
        const [inventarioDesdeApi, movimientosDesdeApi] = await Promise.all([
          obtenerInventario(),
          obtenerMovimientosInventario(),
        ]);

        setInventario(inventarioDesdeApi);
        setMovimientosInventario(movimientosDesdeApi);
      } catch {
        setInventario(inventoryItems);
        setMovimientosInventario(stockMovements);
        setMensajeInventario('Mostrando datos locales de inventario');
      } finally {
        setCargandoInventario(false);
      }
    }

    void cargarInventario();
  }, []);

  async function recargarClientes() {
    const clientesDesdeApi = await obtenerClientes();
    setClientes(clientesDesdeApi);
    setErrorClientes(null);
  }

  async function handleCrearCliente(cliente: CrearClientePayload) {
    setGuardandoCliente(true);
    setMensajeFormulario(null);

    try {
      await crearCliente(cliente);
      // Se vuelve a consultar la API para que la lista refleje exactamente lo guardado en PostgreSQL.
      await recargarClientes();
      setMensajeFormulario('Cliente registrado correctamente');
      return true;
    } catch (error) {
      setMensajeFormulario(error instanceof Error ? error.message : 'No se pudo registrar el cliente');
      return false;
    } finally {
      setGuardandoCliente(false);
    }
  }

  async function recargarOrdenes() {
    const ordenesDesdeApi = await obtenerOrdenesTrabajo();
    setOrdenes(ordenesDesdeApi);
  }

  async function handleCrearOrden(orden: CrearOrdenTrabajoPayload) {
    setGuardandoOrden(true);
    setMensajeOrden(null);

    try {
      await crearOrdenTrabajo(orden);
      await recargarOrdenes();
      setMensajeOrden('Orden de trabajo creada correctamente');
      return true;
    } catch (error) {
      setMensajeOrden(error instanceof Error ? error.message : 'No se pudo crear la orden de trabajo');
      return false;
    } finally {
      setGuardandoOrden(false);
    }
  }

  function actualizarCampoInventario(campo: keyof InventarioFormulario, valor: string) {
    setFormularioInventario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function validarFormularioInventario(): ActualizarStockPayload | null {
    const nombre = formularioInventario.nombre.trim();

    if (!nombre) {
      setMensajeInventario('Ingresa el nombre del repuesto');
      return null;
    }

    const stock = Number(formularioInventario.stock);
    const minimo = formularioInventario.minimo.trim().length > 0 ? Number(formularioInventario.minimo) : undefined;

    if (!Number.isInteger(stock) || stock < 0) {
      setMensajeInventario('El stock nuevo debe ser un numero mayor o igual a 0');
      return null;
    }

    if (typeof minimo === 'number' && (!Number.isInteger(minimo) || minimo < 0)) {
      setMensajeInventario('El minimo debe ser un numero mayor o igual a 0');
      return null;
    }

    return {
      nombre,
      categoria: formularioInventario.categoria.trim() || undefined,
      minimo,
      stock,
      nota: formularioInventario.nota.trim() || undefined,
    };
  }

  async function recargarInventario() {
    const [inventarioDesdeApi, movimientosDesdeApi] = await Promise.all([
      obtenerInventario(),
      obtenerMovimientosInventario(),
    ]);

    setInventario(inventarioDesdeApi);
    setMovimientosInventario(movimientosDesdeApi);
  }

  async function handleActualizarStockInventario() {
    const payload = validarFormularioInventario();

    if (!payload) {
      return;
    }

    setCargandoInventario(true);
    setMensajeInventario(null);

    try {
      await actualizarStockInventario(payload);
      await recargarInventario();
      setMensajeInventario('Stock actualizado correctamente');
    } catch (error) {
      setMensajeInventario(error instanceof Error ? error.message : 'No se pudo actualizar el stock');
    } finally {
      setCargandoInventario(false);
    }
  }

  async function handleRegistrarEntradaInventario() {
    const nombre = formularioInventario.nombre.trim();
    const cantidad = Number(formularioInventario.cantidad);
    const minimo = formularioInventario.minimo.trim().length > 0 ? Number(formularioInventario.minimo) : undefined;

    if (!nombre) {
      setMensajeInventario('Ingresa el nombre del repuesto');
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      setMensajeInventario('La entrada debe ser un numero mayor a 0');
      return;
    }

    if (typeof minimo === 'number' && (!Number.isInteger(minimo) || minimo < 0)) {
      setMensajeInventario('El minimo debe ser un numero mayor o igual a 0');
      return;
    }

    const payload: RegistrarEntradaPayload = {
      nombre,
      categoria: formularioInventario.categoria.trim() || undefined,
      minimo,
      cantidad,
      nota: formularioInventario.nota.trim() || undefined,
    };

    setCargandoInventario(true);
    setMensajeInventario(null);

    try {
      await registrarEntradaInventario(payload);
      await recargarInventario();
      setMensajeInventario('Entrada registrada correctamente');
    } catch (error) {
      setMensajeInventario(error instanceof Error ? error.message : 'No se pudo registrar la entrada');
    } finally {
      setCargandoInventario(false);
    }
  }

  // Navega a la sección Movimientos y opcionalmente hace scroll al objetivo
  function handleIrAMovimientos(target?: 'top' | 'entry' | 'recent') {
    setActiveSection('Movimientos');
    // esperar al render
    setTimeout(() => {
      let id = 'update-stock-top';
      if (target === 'entry') id = 'register-entry';
      if (target === 'recent') id = 'recent-movements';
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }

  function handleIrAStockBajo() {
    setActiveSection('Stock bajo');
  }

  function handleRoleChange(role: UserRole) {
    setActiveRole(role);
    setActiveSection(roleConfig[role].navItems[0]);
  }

  function handlePrimaryAction() {
    if (activeRole === 'Recepcionista') {
      setActiveSection('Ordenes');
    }
    if (activeRole === 'Inventario') {
      handleIrAMovimientos('top');
    }
  }

  function handleSecondaryAction() {
    if (activeRole === 'Recepcionista') {
      setActiveSection('Clientes');
    }

    if (activeRole === 'Inventario') {
      setActiveSection('Movimientos');
    }
  }

  return (
    <AppLayout
      activeRole={activeRole}
      activeNavItem={activeSection}
      navItems={currentRole.navItems}
      onNavChange={setActiveSection}
      onRoleChange={handleRoleChange}
    >
      <Header
        title={currentRole.title}
        description={currentRole.description}
        secondaryAction={currentRole.secondaryAction}
        primaryAction={currentRole.primaryAction}
        onPrimaryAction={handlePrimaryAction}
        onSecondaryAction={handleSecondaryAction}
      />
      <RoleDashboard
        activeSection={activeSection}
        cargandoClientes={cargandoClientes}
        clientes={clientes}
        errorClientes={errorClientes}
        guardandoCliente={guardandoCliente}
        guardandoOrden={guardandoOrden}
        mensajeFormulario={mensajeFormulario}
        mensajeOrden={mensajeOrden}
        onCrearCliente={handleCrearCliente}
        onCrearOrden={handleCrearOrden}
        ordenes={ordenes}
        cargandoInventario={cargandoInventario}
        formularioInventario={formularioInventario}
        inventario={inventario}
        mensajeInventario={mensajeInventario}
        movimientosInventario={movimientosInventario}
        onActualizarCampoInventario={actualizarCampoInventario}
        onActualizarStockInventario={handleActualizarStockInventario}
        onRegistrarEntradaInventario={handleRegistrarEntradaInventario}
        onIrAMovimientos={handleIrAMovimientos}
        onIrAStockBajo={handleIrAStockBajo}
        role={activeRole}
      />
    </AppLayout>
  );
}

export default App;
