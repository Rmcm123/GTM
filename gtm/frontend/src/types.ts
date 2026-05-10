export type OrderStatus = 'Pendiente' | 'En revision' | 'En proceso' | 'Finalizada';

export type UserRole = 'Administrador' | 'Recepcionista' | 'Mecanico' | 'Inventario';

export type WorkOrder = {
  id: string;
  client: string;
  vehicle: string;
  mechanic: string;
  status: OrderStatus;
  checkIn: string;
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

export type InventoryItem = {
  id?: string;
  name: string;
  stock: number;
  minimum: number;
  category: string;
};

export type StockMovement = {
  item: string;
  type: 'Entrada' | 'Salida' | 'Actualizacion';
  quantity: number;
  date: string;
};

export type SummaryCardData = {
  label: string;
  value: string;
  helper: string;
  borderClass: string;
};
