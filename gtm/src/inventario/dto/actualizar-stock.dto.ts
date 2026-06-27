export type ActualizarStockDto = {
  nombre: string;
  categoria?: string;
  minimo?: number;
  precioUnitario?: number;
  stock: number;
  nota?: string;
};
