export type CrearOrdenTrabajoDto = {
  patenteVehiculo: string;
  tipoServicio: string;
  diagnosticoInicial: string;
  mecanicoAsignado?: string;
  fechaIngreso: string;
  costoManoObra?: number;
  costoRepuestos?: number;
  repuestos?: RepuestoOrdenDto[];
};

export type RepuestoOrdenDto = {
  nombre: string;
  cantidad: number;
};
