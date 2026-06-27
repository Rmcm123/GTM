export type RegistrarEntradaDto = {
  nombre: string;
  categoria?: string;
  minimo?: number;
  precioUnitario?: number;
  cantidad: number;
  nota?: string;
};
