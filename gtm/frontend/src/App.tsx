import { useEffect, useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { Header } from './components/Header';
import { RoleDashboard } from './views/RoleDashboard';
import { crearCliente, obtenerClientes, type CrearClientePayload } from './api/clientesApi';
import { crearOrdenTrabajo, obtenerOrdenesTrabajo, type CrearOrdenTrabajoPayload } from './api/ordenesTrabajoApi';
import {
  actualizarStockInventario,
  obtenerAlertasStockBajo,
  obtenerInventario,
  obtenerMovimientosInventario,
  registrarEntradaInventario,
  registrarSalidaInventario,
  type ActualizarStockPayload,
  type RegistrarEntradaPayload,
  type RegistrarSalidaPayload,
} from './api/inventarioApi';
import {
  clientes as clientesMock,
  inventoryItems,
  roleConfig,
  stockMovements,
  workOrders,
} from './data/mockData';
import type { AlertaStockBajo, Cliente, InventarioFormulario, InventoryItem, RepuestoSolicitado, StockMovement, UserRole, WorkOrder } from './types';

const formularioInventarioInicial: InventarioFormulario = {
  nombre: '',
  categoria: '',
  minimo: '',
  stock: '',
  cantidad: '',
  nota: '',
};

function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('Administrador');
  const currentRole = roleConfig[activeRole];
  const navItemsFiltrados = currentRole.navItems.filter((item) => !(activeRole === 'Mecanico' && (item === 'Estados' || item === 'Estado')));
  const [activeSection, setActiveSection] = useState(navItemsFiltrados[0]);
  const [clientes, setClientes] = useState<Cliente[]>(clientesMock);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [errorClientes, setErrorClientes] = useState<string | null>(null);
  const [guardandoCliente, setGuardandoCliente] = useState(false);
  const [guardandoOrden, setGuardandoOrden] = useState(false);
  const [mensajeFormulario, setMensajeFormulario] = useState<string | null>(null);
  const [ordenesTrabajo, setOrdenesTrabajo] = useState<WorkOrder[]>([]);
  const [mensajeOrden, setMensajeOrden] = useState<string | null>(null);
  const [ordenes, setOrdenes] = useState<WorkOrder[]>([]);
  const [inventario, setInventario] = useState<InventoryItem[]>(inventoryItems);
  const [alertasStockBajo, setAlertasStockBajo] = useState<AlertaStockBajo[]>([]);
  const [movimientosInventario, setMovimientosInventario] = useState<StockMovement[]>(stockMovements);
  const [repuestosSolicitados, setRepuestosSolicitados] = useState<RepuestoSolicitado[]>([]);
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
        setOrdenesTrabajo(ordenesDesdeApi);
      } catch {
        setOrdenes(workOrders);
        setOrdenesTrabajo(workOrders);
      }
    }

    void cargarOrdenes();
  }, []);

  useEffect(() => {
    async function cargarInventario() {
      setCargandoInventario(true);

      try {
        const [inventarioDesdeApi, movimientosDesdeApi, alertasDesdeApi] = await Promise.all([
          obtenerInventario(),
          obtenerMovimientosInventario(),
          obtenerAlertasStockBajo(),
        ]);

        setInventario(inventarioDesdeApi);
        setMovimientosInventario(movimientosDesdeApi);
        setAlertasStockBajo(alertasDesdeApi);
      } catch {
        setInventario(inventoryItems);
        setMovimientosInventario(stockMovements);
        setAlertasStockBajo([]);
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
    setOrdenesTrabajo(ordenesDesdeApi);
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

    const stock = formularioInventario.stock.trim().length > 0 ? Number(formularioInventario.stock) : 0;
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
    const [inventarioDesdeApi, movimientosDesdeApi, alertasDesdeApi] = await Promise.all([
      obtenerInventario(),
      obtenerMovimientosInventario(),
      obtenerAlertasStockBajo(),
    ]);

    setInventario(inventarioDesdeApi);
    setMovimientosInventario(movimientosDesdeApi);
    setAlertasStockBajo(alertasDesdeApi);
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
      setMensajeInventario('Repuesto creado correctamente');
      setFormularioInventario(formularioInventarioInicial);
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
      setMensajeInventario('Repuesto reponido correctamente');
      setFormularioInventario(formularioInventarioInicial);
    } catch (error) {
      setMensajeInventario(error instanceof Error ? error.message : 'No se pudo registrar la entrada');
    } finally {
      setCargandoInventario(false);
    }
  }

  async function handleRegistrarSalidaInventario() {
    const nombre = formularioInventario.nombre.trim();
    const cantidad = Number(formularioInventario.cantidad);

    if (!nombre) {
      setMensajeInventario('Selecciona el repuesto a descontar');
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      setMensajeInventario('La salida debe ser un numero mayor a 0');
      return;
    }

    const payload: RegistrarSalidaPayload = {
      nombre,
      cantidad,
      nota: formularioInventario.nota.trim() || undefined,
    };

    setCargandoInventario(true);
    setMensajeInventario(null);

    try {
      await registrarSalidaInventario(payload);
      await recargarInventario();
      setMensajeInventario('Salida registrada correctamente');
      setFormularioInventario(formularioInventarioInicial);
    } catch (error) {
      setMensajeInventario(error instanceof Error ? error.message : 'No se pudo registrar la salida');
    } finally {
      setCargandoInventario(false);
    }
  }

  // Navega a la sección Movimientos y opcionalmente hace scroll al objetivo
  function handleIrAMovimientos(target?: 'top' | 'entry' | 'exit' | 'recent') {
    setActiveSection('Movimientos');
    // esperar al render
    setTimeout(() => {
      let id = 'update-stock-top';
      if (target === 'entry') id = 'register-entry';
      if (target === 'exit') id = 'register-output';
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
    const navs = roleConfig[role].navItems.filter((item) => !(role === 'Mecanico' && (item === 'Estados' || item === 'Estado')));
    setActiveSection(navs[0]);
  }

  function handlePrimaryAction() {
    if (activeRole === 'Administrador') {
      setActiveSection('Ordenes');
    }
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

  function handleActualizarEstadoOT(id: string, nuevoEstado: WorkOrder['status']) {
    setOrdenesTrabajo((actuales) =>
      actuales.map((ot) => (ot.id === id ? { ...ot, status: nuevoEstado } : ot))
    );
  }

  function handleSolicitarRepuesto(nombre: string, cantidad: number, mecanico: string, ordenTrabajo: string, observaciones?: string) {
    const nuevoRepuesto: RepuestoSolicitado = {
      id: `REQ-${Date.now()}`,
      nombre,
      cantidad,
      mecanico,
      ordenTrabajo,
      observaciones,
      fecha: new Date().toISOString().split('T')[0],
    };
    setRepuestosSolicitados((actuales) => [...actuales, nuevoRepuesto]);
  }

  return (
    <AppLayout
      activeRole={activeRole}
      activeNavItem={activeSection}
      navItems={navItemsFiltrados}
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
        alertasStockBajo={alertasStockBajo}
        mensajeInventario={mensajeInventario}
        movimientosInventario={movimientosInventario}
        onActualizarCampoInventario={actualizarCampoInventario}
        onActualizarStockInventario={handleActualizarStockInventario}
        onRegistrarEntradaInventario={handleRegistrarEntradaInventario}
        onRegistrarSalidaInventario={handleRegistrarSalidaInventario}
        onIrAMovimientos={handleIrAMovimientos}
        onIrAStockBajo={handleIrAStockBajo}
        ordenesTrabajo={ordenesTrabajo}
        repuestosSolicitados={repuestosSolicitados}
        onActualizarEstadoOT={handleActualizarEstadoOT}
        onSolicitarRepuesto={handleSolicitarRepuesto}
        onNavigate={setActiveSection}
        role={activeRole}
      />
    </AppLayout>
  );
}

export default App;
