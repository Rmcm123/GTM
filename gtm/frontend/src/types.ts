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

export type InventoryItem = {
  name: string;
  stock: number;
  minimum: number;
  category: string;
};

export type StockMovement = {
  item: string;
  type: 'Entrada' | 'Salida';
  quantity: number;
  date: string;
};

export type SummaryCardData = {
  label: string;
  value: string;
  helper: string;
  borderClass: string;
};
