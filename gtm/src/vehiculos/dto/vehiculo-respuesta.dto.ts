export type VehiculoRespuestaDto = {
  id: string;
  patente: string;
  marca: string;
  modelo: string;
  año: number;
  color?: string;
  kilometraje?: number;
  clienteId: string;
  rutCliente?: string;
  nombreCliente?: string;
};
