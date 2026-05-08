INSERT INTO clientes (rut, nombre, telefono, correo, patente_vehiculo, vehiculo)
VALUES
  ('12.345.678-9', 'Juan Perez', '+56 9 6123 4567', 'juan.perez@correo.cl', 'ABCD-12', 'Toyota Corolla 2018'),
  ('18.765.432-1', 'Maria Gomez', '+56 9 7345 2211', 'maria.gomez@correo.cl', 'L200-21', 'Mitsubishi L200 2021'),
  ('15.222.111-4', 'Carlos Ruiz', '+56 9 8451 8832', 'carlos.ruiz@correo.cl', 'FRNG-15', 'Ford Ranger 2015')
ON CONFLICT (rut) DO NOTHING;
