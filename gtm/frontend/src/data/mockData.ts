import type {
  Cliente,
  InventoryItem,
  StockMovement,
  SummaryCardData,
  UserRole,
  WorkOrder,
} from '../types';

export const roleOptions: { role: UserRole; description: string }[] = [
  { role: 'Administrador', description: 'Vista general del taller' },
  { role: 'Recepcionista', description: 'Clientes, vehiculos y ordenes' },
  { role: 'Mecanico', description: 'Ordenes asignadas y estados' },
  { role: 'Inventario', description: 'Stock y repuestos' },
];

export const roleConfig: Record<
  UserRole,
  {
    navItems: string[];
    title: string;
    description: string;
    primaryAction: string;
    secondaryAction: string;
    actions: string[];
  }
> = {
  Administrador: {
    navItems: ['Dashboard', 'Ordenes', 'Clientes', 'Inventario', 'Historial Garantias'],
    title: 'Dashboard administrador',
    description: 'Vista general para supervisar el funcionamiento del taller.',
    primaryAction: '',
    secondaryAction: '',
    actions: ['Ver ordenes', 'Ver inventario', 'Gestionar usuarios', 'Ver lista de espera', 'Ver historial garantias'],
  },
  Recepcionista: {
    navItems: ['Recepcion', 'Clientes', 'Vehiculos', 'Ordenes', 'Pagos', 'Historial Garantias'],
    title: 'Panel de recepcion',
    description: 'Ingreso de clientes, vehiculos y nuevas ordenes de trabajo.',
    primaryAction: 'Abrir OT',
    secondaryAction: 'Registrar cliente',
    actions: [
      'Registrar cliente',
      'Registrar vehiculo',
      'Abrir OT',
      'Registrar pago',
      'Ver lista de espera',
      'Ver historial garantias',
    ],
  },
  Mecanico: {
    navItems: ['Mis ordenes', 'Estados', 'Vehiculos'],
    title: 'Panel mecanico',
    description:
      'Ordenes asignadas para revisar, avanzar y finalizar trabajos.',
    primaryAction: 'Cambiar estado',
    secondaryAction: 'Ver detalle OT',
    actions: [
      'Iniciar revision',
      'Pasar a proceso',
      'Finalizar OT',
      'Solicitar repuesto',
    ],
  },
  Inventario: {
    navItems: [
      'Inventario',
      'Stock bajo',
      'Movimientos',
      'Repuestos solicitados',
    ],
    title: 'Panel de inventario',
    description: 'Control de repuestos, entradas, salidas y stock bajo.',
    primaryAction: 'Actualizar stock',
    secondaryAction: 'Reponer repuesto',
    actions: [
      'Reponer repuesto',
      'Registrar salida',
      'Revisar stock bajo',
      'Crear repuesto',
    ],
  },
};

export const adminSummary: SummaryCardData[] = [
  {
    label: 'Ordenes activas',
    value: '4',
    helper: 'Trabajos abiertos en el taller',
    borderClass: 'border-t-[#0f8a5f]',
  },
  {
    label: 'En revision',
    value: '1',
    helper: 'Vehiculo esperando diagnostico',
    borderClass: 'border-t-[#d48806]',
  },
  {
    label: 'Stock bajo',
    value: '2',
    helper: 'Repuestos bajo el minimo definido',
    borderClass: 'border-t-[#dc2626]',
  },
];

export const receptionSummary: SummaryCardData[] = [
  {
    label: 'Cupos disponibles',
    value: '2',
    helper: 'Puede ingresar nuevas ordenes',
    borderClass: 'border-t-[#2563eb]',
  },
  {
    label: 'Vehiculos en espera',
    value: '1',
    helper: 'Pendiente de asignar mecanico',
    borderClass: 'border-t-[#0f8a5f]',
  },
  {
    label: 'Pendientes',
    value: '1',
    helper: 'Orden esperando confirmacion',
    borderClass: 'border-t-[#d48806]',
  },
];

export const mechanicSummary: SummaryCardData[] = [
  {
    label: 'Mis ordenes',
    value: '2',
    helper: 'Asignadas para la jornada',
    borderClass: 'border-t-[#2563eb]',
  },
  {
    label: 'En revision',
    value: '1',
    helper: 'Diagnostico pendiente',
    borderClass: 'border-t-[#d48806]',
  },
  {
    label: 'Finalizadas',
    value: '1',
    helper: 'Listas para recepcion',
    borderClass: 'border-t-[#0f8a5f]',
  },
];

export const inventorySummary: SummaryCardData[] = [
  {
    label: 'Articulos',
    value: '3',
    helper: 'Repuestos registrados',
    borderClass: 'border-t-[#2563eb]',
  },
  {
    label: 'Stock bajo',
    value: '2',
    helper: 'Requieren reposicion',
    borderClass: 'border-t-[#dc2626]',
  },
  {
    label: 'Movimientos',
    value: '3',
    helper: 'Entradas y salidas recientes',
    borderClass: 'border-t-[#0f8a5f]',
  },
];

export const workOrders: WorkOrder[] = [
  {
    id: 'OT-001',
    client: 'Juan Perez',
    vehicle: 'Toyota Corolla 2018',
    mechanic: 'Matias Rojas',
    status: 'En proceso',
    checkIn: '07/05/2026',
    tipoServicio: 'Reparacion',
  },
  {
    id: 'OT-002',
    client: 'Maria Gomez',
    vehicle: 'Mitsubishi L200 2021',
    mechanic: 'Camila Torres',
    status: 'En revision',
    checkIn: '07/05/2026',
    tipoServicio: 'Revision general',
  },
  {
    id: 'OT-003',
    client: 'Carlos Ruiz',
    vehicle: 'Ford Ranger 2015',
    mechanic: 'Diego Silva',
    status: 'Pendiente',
    checkIn: '06/05/2026',
    tipoServicio: 'Mantencion',
  },
  {
    id: 'OT-004',
    client: 'Ana Silva',
    vehicle: 'Chevrolet Spark 2019',
    mechanic: 'Camila Torres',
    status: 'Finalizada',
    checkIn: '05/05/2026',
    tipoServicio: 'Cambio de aceite',
    fechaTermino: new Date().toISOString(),
  },
];

export const clientes: Cliente[] = [
  {
    rut: '12.345.678-9',
    nombre: 'Juan Perez',
    telefono: '+56 9 6123 4567',
    correo: 'juan.perez@correo.cl',
  },
  {
    rut: '18.765.432-1',
    nombre: 'Maria Gomez',
    telefono: '+56 9 7345 2211',
    correo: 'maria.gomez@correo.cl',
  },
  {
    rut: '15.222.111-4',
    nombre: 'Carlos Ruiz',
    telefono: '+56 9 8451 8832',
    correo: 'carlos.ruiz@correo.cl',
  },
];

export const inventoryItems: InventoryItem[] = [
  {
    name: 'Aceite 10W-40',
    category: 'Lubricantes',
    stock: 6,
    minimum: 8,
    unitPrice: 18000,
  },
  {
    name: 'Filtro de aire',
    category: 'Filtros',
    stock: 3,
    minimum: 6,
    unitPrice: 12000,
  },
  {
    name: 'Bujias',
    category: 'Encendido',
    stock: 14,
    minimum: 10,
    unitPrice: 4500,
  },
];

export const stockMovements: StockMovement[] = [
  { item: 'Aceite 10W-40', type: 'Salida', quantity: 2, date: '07/05/2026' },
  { item: 'Filtro de aire', type: 'Salida', quantity: 1, date: '07/05/2026' },
  { item: 'Bujias', type: 'Entrada', quantity: 8, date: '06/05/2026' },
];

export const workflow = [
  { status: 'Pendiente', count: 1 },
  { status: 'En revision', count: 1 },
  { status: 'En proceso', count: 1 },
  { status: 'Finalizada', count: 1 },
];
