export type CrearOrdenTrabajoDto = {
  patenteVehiculo: string;
  tipoServicio: string;
  diagnosticoInicial: string;
  mecanicoAsignado?: string;
  fechaIngreso: string;
};
