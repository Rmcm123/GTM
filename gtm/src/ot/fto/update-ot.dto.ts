export type UpdateOtDto = Partial<{
  numeroOrden: string;
  mecanicoId: string;
  fechaPromesaSalida: Date;
  fechaSalida: Date;
  estado: 'pendiente' | 'progreso' | 'finalizado' | 'entregado';
  diagnostico: string;
  precioTotal: number;
}>;
