export type MovimientoRespuestaDto = {
  id: string;
  repuestoId: string;
  nombre: string;
  tipo: 'Entrada' | 'Salida' | 'Actualizacion';
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  nota?: string;
  creadoEn: string;
};
