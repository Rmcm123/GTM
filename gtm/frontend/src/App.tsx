import { useEffect, useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { Header } from './components/Header';
import { RoleDashboard } from './views/RoleDashboard';
import { cerrarSesion } from './api/autenticacionApi';
import { EVENTO_SESION_EXPIRADA } from './api/fetchAutenticado';
import {
  actualizarCliente,
  crearCliente,
  obtenerClientes,
  type ActualizarClientePayload,
  type CrearClientePayload,
} from './api/clientesApi';
import {
  agregarRepuestosOrden,
  actualizarEstadoOrden,
  crearOrdenTrabajo,
  obtenerOrdenesTrabajo,
  type CrearOrdenTrabajoPayload,
} from './api/ordenesTrabajoApi';
import { registrarPago, type RegistrarPagoPayload } from './api/pagosApi';
import { obtenerPerfil } from './api/perfilApi';
import {
  limpiarSesion,
  obtenerUsuarioGuardado,
  type UsuarioSesion,
} from './api/sesionApi';
import {
  actualizarEstadoUsuario,
  crearUsuario,
  obtenerMecanicos,
  obtenerUsuarios,
  type CrearUsuarioPayload,
} from './api/usuariosApi';
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
} from './types';
import { LoginView } from './views/LoginView';

const formularioInventarioInicial: InventarioFormulario = {
  nombre: '',
  categoria: '',
  minimo: '',
  precioUnitario: '',
  stock: '',
  cantidad: '',
  nota: '',
};

function App() {
  const [usuarioSesion, setUsuarioSesion] = useState<UsuarioSesion | null>(() =>
    obtenerUsuarioGuardado(),
  );
  const [activeRole, setActiveRole] = useState<UserRole>(
    usuarioSesion?.rol ?? 'Administrador',
  );
  const currentRole = roleConfig[activeRole];
  const navItemsFiltrados = currentRole.navItems.filter(
    (item) =>
      !(activeRole === 'Mecanico' && (item === 'Estados' || item === 'Estado')),
  );
  const [activeSection, setActiveSection] = useState(navItemsFiltrados[0]);
  const [clientes, setClientes] = useState<Cliente[]>(clientesMock);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [errorClientes, setErrorClientes] = useState<string | null>(null);
  const [guardandoCliente, setGuardandoCliente] = useState(false);
  const [guardandoClienteActualizado, setGuardandoClienteActualizado] =
    useState(false);
  const [guardandoOrden, setGuardandoOrden] = useState(false);
  const [guardandoPago, setGuardandoPago] = useState(false);
  const [guardandoUsuario, setGuardandoUsuario] = useState(false);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [mensajeFormulario, setMensajeFormulario] = useState<string | null>(
    null,
  );
  const [ordenesTrabajo, setOrdenesTrabajo] = useState<WorkOrder[]>([]);
  const [mensajeOrden, setMensajeOrden] = useState<string | null>(null);
  const [mensajePago, setMensajePago] = useState<string | null>(null);
  const [mensajeUsuarios, setMensajeUsuarios] = useState<string | null>(null);
  const [mensajeEstadoOrden, setMensajeEstadoOrden] = useState<string | null>(
    null,
  );
  const [ordenes, setOrdenes] = useState<WorkOrder[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [mecanicos, setMecanicos] = useState<UsuarioSistema[]>([]);
  const [inventario, setInventario] = useState<InventoryItem[]>(inventoryItems);
  const [alertasStockBajo, setAlertasStockBajo] = useState<AlertaStockBajo[]>(
    [],
  );
  const [movimientosInventario, setMovimientosInventario] =
    useState<StockMovement[]>(stockMovements);
  const [repuestosSolicitados, setRepuestosSolicitados] = useState<
    RepuestoSolicitado[]
  >([]);
  const [cargandoInventario, setCargandoInventario] = useState(false);
  const [mensajeInventario, setMensajeInventario] = useState<string | null>(
    null,
  );
  const [formularioInventario, setFormularioInventario] =
    useState<InventarioFormulario>(formularioInventarioInicial);

  useEffect(() => {
    function volverAlLoginPorSesionExpirada() {
      setUsuarioSesion(null);
      setActiveRole('Administrador');
      setActiveSection(roleConfig.Administrador.navItems[0]);
    }

    window.addEventListener(
      EVENTO_SESION_EXPIRADA,
      volverAlLoginPorSesionExpirada,
    );

    return () => {
      window.removeEventListener(
        EVENTO_SESION_EXPIRADA,
        volverAlLoginPorSesionExpirada,
      );
    };
  }, []);

  useEffect(() => {
    if (!usuarioSesion) {
      return;
    }

    let componenteActivo = true;

    async function validarSesionActual() {
      try {
        const perfil = await obtenerPerfil();

        if (!componenteActivo) {
          return;
        }

        setUsuarioSesion(perfil);
        setActiveRole(perfil.rol);
      } catch {
        if (!componenteActivo) {
          return;
        }

        limpiarSesion();
        setUsuarioSesion(null);
        setActiveRole('Administrador');
        setActiveSection(roleConfig.Administrador.navItems[0]);
      }
    }

    void validarSesionActual();

    return () => {
      componenteActivo = false;
    };
  }, [usuarioSesion?.id]);

  useEffect(() => {
    if (!usuarioSesion) {
      return;
    }

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
  }, [usuarioSesion]);

  useEffect(() => {
    if (!usuarioSesion) {
      return;
    }

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
  }, [usuarioSesion]);

  useEffect(() => {
    if (!usuarioSesion) {
      return;
    }

    const usuarioActual = usuarioSesion;

    async function cargarInventario() {
      setCargandoInventario(true);

      try {
        if (usuarioActual.rol === 'Recepcionista') {
          const inventarioDesdeApi = await obtenerInventario();
          setInventario(inventarioDesdeApi);
          setMovimientosInventario(stockMovements);
          setAlertasStockBajo([]);
          return;
        }

        const [inventarioDesdeApi, movimientosDesdeApi, alertasDesdeApi] =
          await Promise.all([
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
  }, [usuarioSesion]);

  useEffect(() => {
    if (!usuarioSesion || usuarioSesion.rol !== 'Administrador') {
      setUsuarios([]);
      return;
    }

    async function cargarUsuarios() {
      setCargandoUsuarios(true);
      setMensajeUsuarios(null);

      try {
        const usuariosDesdeApi = await obtenerUsuarios();
        setUsuarios(usuariosDesdeApi);
      } catch (error) {
        setMensajeUsuarios(
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar los usuarios',
        );
      } finally {
        setCargandoUsuarios(false);
      }
    }

    void cargarUsuarios();
  }, [usuarioSesion]);

  useEffect(() => {
    if (
      !usuarioSesion ||
      !['Administrador', 'Recepcionista'].includes(usuarioSesion.rol)
    ) {
      setMecanicos([]);
      return;
    }

    async function cargarMecanicos() {
      try {
        const mecanicosDesdeApi = await obtenerMecanicos();
        setMecanicos(mecanicosDesdeApi);
      } catch {
        setMecanicos([]);
      }
    }

    void cargarMecanicos();
  }, [usuarioSesion]);

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
      setMensajeFormulario(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar el cliente',
      );
      return false;
    } finally {
      setGuardandoCliente(false);
    }
  }

  async function handleActualizarCliente(
    rut: string,
    cliente: ActualizarClientePayload,
  ) {
    setGuardandoClienteActualizado(true);
    setMensajeFormulario(null);

    try {
      await actualizarCliente(rut, cliente);
      await recargarClientes();
      setMensajeFormulario('Cliente actualizado correctamente');
      return true;
    } catch (error) {
      setMensajeFormulario(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el cliente',
      );
      return false;
    } finally {
      setGuardandoClienteActualizado(false);
    }
  }

  async function recargarOrdenes() {
    const ordenesDesdeApi = await obtenerOrdenesTrabajo();
    setOrdenes(ordenesDesdeApi);
    setOrdenesTrabajo(ordenesDesdeApi);
  }

  async function recargarUsuarios() {
    const usuariosDesdeApi = await obtenerUsuarios();
    setUsuarios(usuariosDesdeApi);
  }

  async function handleCrearUsuario(usuario: CrearUsuarioPayload) {
    setGuardandoUsuario(true);
    setMensajeUsuarios(null);

    try {
      await crearUsuario(usuario);
      await recargarUsuarios();
      setMensajeUsuarios('Usuario creado correctamente');
      return true;
    } catch (error) {
      setMensajeUsuarios(
        error instanceof Error ? error.message : 'No se pudo crear el usuario',
      );
      return false;
    } finally {
      setGuardandoUsuario(false);
    }
  }

  async function handleActualizarEstadoUsuario(
    usuarioId: string,
    activo: boolean,
  ) {
    setMensajeUsuarios(null);

    try {
      await actualizarEstadoUsuario(usuarioId, activo);
      await recargarUsuarios();
      setMensajeUsuarios(
        activo
          ? 'Usuario activado correctamente'
          : 'Usuario desactivado correctamente',
      );
      return true;
    } catch (error) {
      setMensajeUsuarios(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el usuario',
      );
      return false;
    }
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
      setMensajeOrden(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la orden de trabajo',
      );
      return false;
    } finally {
      setGuardandoOrden(false);
    }
  }

  async function handleRegistrarPago(pago: RegistrarPagoPayload) {
    setGuardandoPago(true);
    setMensajePago(null);

    try {
      await registrarPago(pago);
      await recargarOrdenes();
      setMensajePago('Pago registrado correctamente');
      return true;
    } catch (error) {
      setMensajePago(
        error instanceof Error ? error.message : 'No se pudo registrar el pago',
      );
      return false;
    } finally {
      setGuardandoPago(false);
    }
  }

  async function handleEntregarOrden(ordenId: string) {
    const idNumerico = parseInt(ordenId.replace('OT-', ''), 10);

    try {
      await actualizarEstadoOrden(idNumerico, 'Entregada');
      await recargarOrdenes();
      setMensajePago('Orden marcada como entregada');
    } catch (error) {
      setMensajePago(
        error instanceof Error ? error.message : 'No se pudo entregar la orden',
      );
    }
  }

  function actualizarCampoInventario(
    campo: keyof InventarioFormulario,
    valor: string,
  ) {
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

    const stock =
      formularioInventario.stock.trim().length > 0
        ? Number(formularioInventario.stock)
        : 0;
    const minimo =
      formularioInventario.minimo.trim().length > 0
        ? Number(formularioInventario.minimo)
        : undefined;
    const precioUnitario =
      formularioInventario.precioUnitario.trim().length > 0
        ? Number(formularioInventario.precioUnitario)
        : undefined;

    if (!Number.isInteger(stock) || stock < 0) {
      setMensajeInventario(
        'El stock nuevo debe ser un numero mayor o igual a 0',
      );
      return null;
    }

    if (
      typeof minimo === 'number' &&
      (!Number.isInteger(minimo) || minimo < 0)
    ) {
      setMensajeInventario('El minimo debe ser un numero mayor o igual a 0');
      return null;
    }

    if (
      typeof precioUnitario === 'number' &&
      (!Number.isInteger(precioUnitario) || precioUnitario < 0)
    ) {
      setMensajeInventario(
        'El precio unitario debe ser un numero mayor o igual a 0',
      );
      return null;
    }

    return {
      nombre,
      categoria: formularioInventario.categoria.trim() || undefined,
      minimo,
      precioUnitario,
      stock,
      nota: formularioInventario.nota.trim() || undefined,
    };
  }

  async function recargarInventario() {
    const [inventarioDesdeApi, movimientosDesdeApi, alertasDesdeApi] =
      await Promise.all([
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
      setMensajeInventario(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el stock',
      );
    } finally {
      setCargandoInventario(false);
    }
  }

  async function handleRegistrarEntradaInventario() {
    const nombre = formularioInventario.nombre.trim();
    const cantidad = Number(formularioInventario.cantidad);
    const minimo =
      formularioInventario.minimo.trim().length > 0
        ? Number(formularioInventario.minimo)
        : undefined;
    const precioUnitario =
      formularioInventario.precioUnitario.trim().length > 0
        ? Number(formularioInventario.precioUnitario)
        : undefined;

    if (!nombre) {
      setMensajeInventario('Ingresa el nombre del repuesto');
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      setMensajeInventario('La entrada debe ser un numero mayor a 0');
      return;
    }

    if (
      typeof minimo === 'number' &&
      (!Number.isInteger(minimo) || minimo < 0)
    ) {
      setMensajeInventario('El minimo debe ser un numero mayor o igual a 0');
      return;
    }

    if (
      typeof precioUnitario === 'number' &&
      (!Number.isInteger(precioUnitario) || precioUnitario < 0)
    ) {
      setMensajeInventario(
        'El precio unitario debe ser un numero mayor o igual a 0',
      );
      return;
    }

    const payload: RegistrarEntradaPayload = {
      nombre,
      categoria: formularioInventario.categoria.trim() || undefined,
      minimo,
      precioUnitario,
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
      setMensajeInventario(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la entrada',
      );
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
      setMensajeInventario(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la salida',
      );
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
    if (usuarioSesion) {
      return;
    }

    setActiveRole(role);
    const navs = roleConfig[role].navItems.filter(
      (item) =>
        !(role === 'Mecanico' && (item === 'Estados' || item === 'Estado')),
    );
    setActiveSection(navs[0]);
  }

  function handleLogin(usuario: UsuarioSesion) {
    setUsuarioSesion(usuario);
    setActiveRole(usuario.rol);
    const navs = roleConfig[usuario.rol].navItems.filter(
      (item) =>
        !(
          usuario.rol === 'Mecanico' &&
          (item === 'Estados' || item === 'Estado')
        ),
    );
    setActiveSection(navs[0]);
  }

  async function handleLogout() {
    await cerrarSesion();
    setUsuarioSesion(null);
    setActiveRole('Administrador');
    setActiveSection(roleConfig.Administrador.navItems[0]);
  }

  function handlePrimaryAction() {
    if (activeRole === 'Administrador') {
      setActiveSection('Usuarios');
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

  async function handleActualizarEstadoOT(
    id: string,
    nuevoEstado: WorkOrder['status'],
  ) {
    const idNumerico = parseInt(id.replace('OT-', ''), 10);
    setMensajeEstadoOrden(null);

    try {
      await actualizarEstadoOrden(idNumerico, nuevoEstado);
      await recargarOrdenes();
      setMensajeEstadoOrden('Estado actualizado correctamente.');
    } catch (error) {
      setMensajeEstadoOrden(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el estado de la orden',
      );
    }
  }

  async function handleSolicitarRepuesto(
    nombre: string,
    cantidad: number,
    mecanico: string,
    ordenTrabajo: string,
    observaciones?: string,
  ): Promise<boolean> {
    const idNumerico = parseInt(ordenTrabajo.replace('OT-', ''), 10);

    try {
      await agregarRepuestosOrden(idNumerico, [{ nombre, cantidad }]);
      await recargarOrdenes();
      const inventarioDesdeApi = await obtenerInventario();
      setInventario(inventarioDesdeApi);
    } catch (error) {
      setMensajeEstadoOrden(
        error instanceof Error
          ? error.message
          : 'No se pudo agregar el repuesto a la orden',
      );
      return false;
    }

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
    setMensajeEstadoOrden('Repuesto agregado al presupuesto de la orden.');
    return true;
  }

  if (!usuarioSesion) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <AppLayout
      activeRole={activeRole}
      activeNavItem={activeSection}
      navItems={navItemsFiltrados}
      onNavChange={setActiveSection}
      onRoleChange={handleRoleChange}
      bloquearCambioRol
      nombreUsuario={usuarioSesion.nombre}
      onLogout={handleLogout}
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
        guardandoClienteActualizado={guardandoClienteActualizado}
        guardandoOrden={guardandoOrden}
        guardandoPago={guardandoPago}
        guardandoUsuario={guardandoUsuario}
        mensajeFormulario={mensajeFormulario}
        mensajeOrden={mensajeOrden}
        mensajePago={mensajePago}
        mensajeEstadoOrden={mensajeEstadoOrden}
        mensajeUsuarios={mensajeUsuarios}
        onCrearCliente={handleCrearCliente}
        onActualizarCliente={handleActualizarCliente}
        onCrearOrden={handleCrearOrden}
        onEntregarOrden={handleEntregarOrden}
        onRegistrarPago={handleRegistrarPago}
        onCrearUsuario={handleCrearUsuario}
        onActualizarEstadoUsuario={handleActualizarEstadoUsuario}
        ordenes={ordenes}
        cargandoUsuarios={cargandoUsuarios}
        usuarios={usuarios}
        mecanicos={mecanicos}
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
        nombreUsuario={usuarioSesion.nombre}
        role={activeRole}
      />
    </AppLayout>
  );
}

export default App;
