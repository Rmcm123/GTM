export type MovimientoRespuestaDto = {
  id: string;
  repuestoId: string;
  nombre: string;
  tipo: 'Entrada' | 'Actualizacion';
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  nota?: string;
  creadoEn: string;
};
