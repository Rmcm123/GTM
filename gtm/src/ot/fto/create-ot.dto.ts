export type CreateOtDto = {
  numeroOrden: string;
  clienteId: string;
  vehiculoId: string;
  mecanicoId?: string;
  fechaPromesaSalida?: Date;
  precioTotal?: number;
  diagnostico?: string;
  adelanto?: number;
};
