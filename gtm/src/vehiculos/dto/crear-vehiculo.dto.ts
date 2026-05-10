export type CrearVehiculoDto = {
  rutCliente: string;
  patente: string;
  marca: string;
  modelo: string;
  año: number;
  color?: string;
  kilometraje?: number;
};
