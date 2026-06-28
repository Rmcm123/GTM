export type AgregarRepuestosOrdenTrabajoDto = {
  repuestos: RepuestoAdicionalOrdenDto[];
};

export type RepuestoAdicionalOrdenDto = {
  nombre: string;
  cantidad: number;
};
