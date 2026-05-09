export type VehiculoRespuestaDto = {
  id: string;
  patente: string;
  marca: string;
  modelo: string;
  ano: number;
  color?: string;
  kilometraje?: number;
  cliente_id: string;
};