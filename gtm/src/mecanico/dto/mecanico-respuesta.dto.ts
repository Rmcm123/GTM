export type MecanicoRespuestaDto = {
  id: string;
  rut: string;
  nombre: string;
  telefono: string;
  correo: string;
  
  estado?: string;
  vehiculosAsignados?: string[];
};
