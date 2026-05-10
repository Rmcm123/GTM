INSERT INTO clientes (rut, nombre, telefono, correo)
VALUES
  ('12.345.678-9', 'Juan Perez', '+56 9 6123 4567', 'juan.perez@correo.cl'),
  ('18.765.432-1', 'Maria Gomez', '+56 9 7345 2211', 'maria.gomez@correo.cl'),
  ('15.222.111-4', 'Carlos Ruiz', '+56 9 8451 8832', 'carlos.ruiz@correo.cl')
ON CONFLICT (rut) DO NOTHING;

INSERT INTO vehiculos (patente, marca, modelo, "año", color, kilometraje, cliente_id)
VALUES
  ('ABCD-12', 'Toyota', 'Corolla', 2018, 'Blanco', 45000, (SELECT id FROM clientes WHERE rut = '12.345.678-9'))
ON CONFLICT (patente) DO UPDATE SET
  marca = EXCLUDED.marca,
  modelo = EXCLUDED.modelo,
  "año" = EXCLUDED."año",
  color = EXCLUDED.color,
  kilometraje = EXCLUDED.kilometraje,
  cliente_id = EXCLUDED.cliente_id;
