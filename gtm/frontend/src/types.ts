export type OrderStatus = 'Pendiente' | 'En revision' | 'En proceso' | 'Finalizada' | 'Entregada' | 'Cancelada';

export type UserRole = 'Administrador' | 'Recepcionista' | 'Mecanico' | 'Inventario';

export type WorkOrder = {
  id: string;
  client: string;
  vehicle: string;
  mechanic: string;
  status: OrderStatus;
  checkIn: string;
  tipoServicio?: string;
  año?: number;
  kilometraje?: number;
  diagnosticoInicial?: string;
};

export type Cliente = {
  id?: string;
  rut: string;
  nombre: string;
  telefono: string;
  correo: string;
};

export type Vehiculo = {
  id?: string;
  rutCliente: string;
  patente: string;
  marca: string;
  modelo: string;
  año: number;
  color: string;
  kilometraje: number;
};

export type InventarioFormulario = {
  nombre: string;
  categoria: string;
  minimo: string;
  stock: string;
  cantidad: string;
  nota: string;
};

export type InventoryItem = {
  id?: string;
  name: string;
  stock: number;
  minimum: number;
  category: string;
};

export type AlertaStockBajo = {
  repuestoId: string;
  nombre: string;
  stock: number;
  minimo: number;
  mensaje: string;
  creadoEn: string;
};

export type StockMovement = {
  item: string;
  type: 'Entrada' | 'Salida' | 'Actualizacion';
  quantity: number;
  date: string;
};

export type RepuestoSolicitado = {
  id: string;
  nombre: string;
  cantidad: number;
  mecanico: string;
  ordenTrabajo: string;
  observaciones?: string;
  fecha: string;
};

export type SummaryCardData = {
  label: string;
  value: string;
  helper: string;
  borderClass: string;
};
