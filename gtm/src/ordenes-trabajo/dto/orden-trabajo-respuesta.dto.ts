import { EstadoOrdenTrabajo } from '../orden-trabajo.entity';

export type OrdenTrabajoRespuestaDto = {
  id: number;
  clienteId: string;
  rutCliente: string;
  nombreCliente: string;
  vehiculoId: string;
  patenteVehiculo: string;
  vehiculo: string;
  tipoServicio: string;
  diagnosticoInicial: string;
  mecanicoAsignado?: string;
  estado: EstadoOrdenTrabajo;
  fechaIngreso: string;
};
