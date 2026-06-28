import type { MembresiaCliente } from '../cliente.entity';

export type CrearClienteDto = {
  rut: string;
  nombre: string;
  telefono: string;
  correo: string;
  esRegular?: boolean;
  porcentajeDescuentoRegular?: number;
  membresia?: MembresiaCliente;
};
