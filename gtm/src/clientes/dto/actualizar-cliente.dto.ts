import type { MembresiaCliente } from '../cliente.entity';

export type ActualizarClienteDto = {
  nombre?: string;
  telefono?: string;
  correo?: string;
  esRegular?: boolean;
  porcentajeDescuentoRegular?: number;
  membresia?: MembresiaCliente;
};
