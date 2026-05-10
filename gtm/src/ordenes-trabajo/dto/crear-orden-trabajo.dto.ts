export type CrearOrdenTrabajoDto = {
  rutCliente: string;
  patenteVehiculo: string;
  tipoServicio: string;
  diagnosticoInicial: string;
  mecanicoAsignado?: string;
  fechaIngreso: string;
};
