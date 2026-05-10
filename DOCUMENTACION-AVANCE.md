# Documentacion del avance

Este documento resume los archivos agregados o modificados para que el equipo entienda la estructura actual del proyecto.

## Scripts de inicio

### `iniciar-proyecto.cmd`

Archivo para iniciar el proyecto facilmente en Windows. Ejecuta el script PowerShell sin que el usuario tenga que escribir el comando completo.

Uso:

```powershell
.\iniciar-proyecto.cmd
```

### `iniciar-proyecto.ps1`

Script principal de arranque. Sirve para iniciar backend y frontend desde cualquier carpeta donde se haya clonado el proyecto, porque calcula las rutas de forma relativa.

Hace lo siguiente:

- Verifica que exista Node.js y `npm.cmd`.
- Verifica que existan las carpetas `gtm` y `gtm/frontend`.
- Crea `gtm/.env` desde `gtm/.env.example` si no existe.
- Instala dependencias si faltan `node_modules`.
- Abre el backend en una ventana.
- Abre el frontend en otra ventana.

## Backend

### `gtm/src/main.ts`

Archivo de entrada del backend NestJS. Inicia la aplicacion, activa CORS para que el frontend pueda llamar a la API local y levanta el servidor en el puerto configurado.

### `gtm/.env.example`

Plantilla de variables de entorno para conectar el backend con PostgreSQL. No contiene contrasenas reales obligatorias; cada PC debe crear su propio `.env`.

Variables principales:

- `DB_HOST`: servidor PostgreSQL.
- `DB_PORT`: puerto de PostgreSQL.
- `DB_USERNAME`: usuario de PostgreSQL.
- `DB_PASSWORD`: contrasena de PostgreSQL.
- `DB_DATABASE`: base de datos del proyecto.
- `DB_SYNCHRONIZE`: permite que TypeORM cree tablas automaticamente en desarrollo.

### `gtm/src/database/database.module.ts`

Modulo encargado de configurar la conexion a PostgreSQL usando TypeORM. Es necesario para que los modulos del backend puedan usar entidades y repositorios.

Usa `ConfigService` para leer los valores desde `.env`, asi no se dejan credenciales escritas directamente en el codigo.

### `gtm/src/clientes/cliente.entity.ts`

Entidad TypeORM que representa la tabla `clientes` en PostgreSQL.

Define los campos principales del cliente:

- `rut`
- `nombre`
- `telefono`
- `correo`

Tambien declara la relacion con `Vehiculo`, porque un cliente puede tener varios vehiculos. TypeORM usa esta clase para crear la tabla y consultar datos.

### `gtm/src/clientes/clientes.module.ts`

Modulo de NestJS para agrupar todo lo relacionado con clientes.

Incluye:

- entidad `Cliente`
- controlador `ClientesController`
- servicio `ClientesService`

### `gtm/src/clientes/clientes.controller.ts`

Controlador que expone la API de clientes.

Por ahora tiene:

```text
GET /clientes
POST /clientes
```

Sirve para que el frontend pueda pedir la lista de clientes guardados en PostgreSQL y registrar nuevos clientes desde recepcion.

### `gtm/src/clientes/clientes.service.ts`

Servicio que contiene la logica para consultar y crear clientes desde la base de datos.

Actualmente:

- obtiene todos los clientes;
- valida datos obligatorios al crear;
- evita registrar dos clientes con el mismo RUT;
- transforma las entidades a un formato de respuesta para no devolver directamente la entidad completa.

### `gtm/src/clientes/dto/cliente-respuesta.dto.ts`

Tipo que define la forma de los datos enviados al frontend cuando se consulta `GET /clientes`.

Ayuda a mantener claro que datos salen desde el backend.

### `gtm/src/clientes/dto/crear-cliente.dto.ts`

Tipo que define los datos que el backend espera recibir cuando el frontend registra un cliente con `POST /clientes`.

Incluye:

- `rut`
- `nombre`
- `telefono`
- `correo`

No incluye vehiculo, porque el vehiculo se registra en su propio modulo y se vincula al cliente por RUT.

### `gtm/src/vehiculos/vehiculo.entity.ts`

Entidad TypeORM que representa la tabla `vehiculos`.

Define:

- `patente`
- `marca`
- `modelo`
- `año`
- `color`
- `kilometraje`
- `clienteId`

Tiene una relacion `ManyToOne` con `Cliente`, ya que varios vehiculos pueden pertenecer al mismo cliente.

### `gtm/src/vehiculos/vehiculos.controller.ts`

Controlador que expone la API de vehiculos.

Por ahora tiene:

```text
GET /vehiculos/cliente/:clienteId
GET /vehiculos/cliente-rut/:rutCliente
GET /vehiculos/patente/:patente
POST /vehiculos
```

Sirve para consultar vehiculos por cliente o patente, y registrar un vehiculo vinculado a un cliente existente usando su RUT.

### `gtm/src/vehiculos/vehiculos.service.ts`

Servicio que contiene la logica de vehiculos.

Actualmente:

- busca vehiculos por `clienteId`;
- busca vehiculos por RUT del cliente;
- busca vehiculos por patente;
- valida datos obligatorios al crear;
- evita registrar dos vehiculos con la misma patente;
- verifica que el cliente exista antes de registrar el vehiculo.

### `gtm/src/vehiculos/dto/crear-vehiculo.dto.ts`

Tipo que define los datos que el backend espera recibir cuando se registra un vehiculo con `POST /vehiculos`.

Incluye `rutCliente` para vincular el vehiculo con un cliente ya registrado.

### `gtm/src/vehiculos/dto/vehiculo-respuesta.dto.ts`

Tipo que define la forma de los datos enviados al frontend cuando se consultan vehiculos.

### `gtm/src/ordenes-trabajo/orden-trabajo.entity.ts`

Entidad TypeORM que representa la tabla `ordenes_trabajo`.

Define el modelo inicial de una orden de trabajo:

- id numerico autoincremental;
- cliente asociado;
- vehiculo asociado;
- tipo de servicio;
- diagnostico inicial;
- mecanico asignado;
- estado;
- fecha de ingreso.

Por ahora el mecanico asignado se guarda como texto, porque aun no existe un modulo real de usuarios o mecanicos. Cuando se implemente login, este campo se puede reemplazar o complementar con una relacion al usuario mecanico.

El id de la orden es numerico para que el frontend pueda mostrar codigos simples como `OT-001`, `OT-002` y evitar mostrar identificadores largos.

### `gtm/src/ordenes-trabajo/ordenes-trabajo.module.ts`

Modulo de NestJS para agrupar lo relacionado con ordenes de trabajo.

Incluye:

- entidad `OrdenTrabajo`;
- controlador `OrdenesTrabajoController`;
- servicio `OrdenesTrabajoService`;
- repositorios necesarios de cliente y vehiculo para validar relaciones.

### `gtm/src/ordenes-trabajo/ordenes-trabajo.controller.ts`

Controlador que expone la API de ordenes de trabajo.

Por ahora tiene:

```text
GET /ordenes-trabajo
GET /ordenes-trabajo/:id
POST /ordenes-trabajo
```

Sirve para listar ordenes, consultar una orden especifica y crear una orden nueva desde recepcion.

### `gtm/src/ordenes-trabajo/ordenes-trabajo.service.ts`

Servicio que contiene la logica de ordenes de trabajo.

Actualmente:

- valida que existan los datos obligatorios;
- busca el cliente por RUT;
- busca el vehiculo por patente;
- verifica que el vehiculo pertenezca al cliente;
- crea la orden en estado `Pendiente`;
- transforma la entidad en un formato claro para la respuesta de la API.

### `gtm/src/ordenes-trabajo/dto/crear-orden-trabajo.dto.ts`

Tipo que define los datos que el backend espera recibir cuando se crea una orden de trabajo.

Incluye:

- `rutCliente`;
- `patenteVehiculo`;
- `tipoServicio`;
- `diagnosticoInicial`;
- `mecanicoAsignado`;
- `fechaIngreso`.

### `gtm/src/ordenes-trabajo/dto/orden-trabajo-respuesta.dto.ts`

Tipo que define la forma de los datos enviados al frontend cuando se consultan o crean ordenes de trabajo.

Incluye datos de la orden, del cliente y del vehiculo para que el frontend no tenga que consultar varias APIs solo para mostrar una lista inicial.

### `gtm/database/semilla-clientes.sql`

Script SQL para insertar clientes iniciales en PostgreSQL.

Sirve para probar el sistema con datos reales y tener clientes iniciales en la base de datos.

## Frontend

### `gtm/frontend/src/api/clientesApi.ts`

Archivo encargado de consumir la API de clientes del backend.

Contiene la funcion:

```ts
obtenerClientes()
crearCliente()
```

Esta funcion hace un `fetch` a:

`obtenerClientes()` hace un `GET /clientes` para listar clientes.

`crearCliente()` hace un `POST /clientes` para guardar un nuevo cliente desde el formulario de recepcion.

Asi el frontend deja de depender solamente de datos escritos en `mockData.ts`.

### `gtm/frontend/src/api/ordenesTrabajoApi.ts`

Archivo encargado de consumir la API de ordenes de trabajo del backend.

Contiene las funciones:

```ts
obtenerOrdenesTrabajo()
crearOrdenTrabajo()
```

`obtenerOrdenesTrabajo()` hace un `GET /ordenes-trabajo` para listar ordenes.

`crearOrdenTrabajo()` hace un `POST /ordenes-trabajo` para crear una orden desde recepcion.

Tambien transforma la respuesta del backend al formato que usa el frontend para mostrar tablas de ordenes.

### `gtm/frontend/src/components/ReceptionPanel.tsx`

Panel visual de recepcion para registrar clientes.

Actualmente:

- muestra el formulario de cliente;
- controla los valores escritos por el usuario;
- envia el formulario al backend;
- muestra si se esta guardando;
- muestra mensajes de exito o error;
- muestra la lista de clientes recientes.

El formulario ya no se limpia si el backend rechaza el registro, por ejemplo cuando el RUT ya existe. Esto evita que el usuario pierda lo que escribio.

### `gtm/frontend/src/components/VehiclesPanel.tsx`

Panel visual de recepcion para registrar vehiculos.

Actualmente:

- muestra un formulario para datos del vehiculo;
- permite asociar el vehiculo a un cliente usando su RUT;
- muestra una lista de clientes disponibles para copiar el RUT al formulario;
- no se conecta todavia con la API, porque primero se esta revisando la interfaz.

### `gtm/frontend/src/components/WorkOrdersPanel.tsx`

Panel visual inicial de recepcion para preparar una orden de trabajo.

Actualmente:

- muestra un formulario para cliente, vehiculo, servicio, mecanico, fecha y diagnostico;
- permite buscar clientes por RUT como ayuda para completar el formulario;
- muestra ordenes activas y finalizadas;
- crea ordenes usando la API `POST /ordenes-trabajo`;
- carga ordenes desde la API `GET /ordenes-trabajo`, usando datos locales como respaldo si el backend no esta disponible.

### `gtm/frontend/src/components/AppLayout.tsx`

Layout general de la aplicacion.

Maneja:

- barra lateral
- selector de rol
- navegacion interna de cada rol
- contenido principal

### `gtm/frontend/src/App.tsx`

Componente principal del frontend.

Actualmente se encarga de:

- mantener el rol activo
- mantener la seccion activa
- cargar clientes desde la API
- crear clientes usando la API
- recargar la lista despues de registrar un cliente
- decidir que vista mostrar segun el rol

Tambien incluye la vista **AdminView**, la cual ha sido mejorada significativamente para:
- Mostrar tarjetas de resumen dinamicas basadas en datos reales de ordenes e inventario.
- Incluir un panel de flujo de trabajo visual para ver las ordenes activas agrupadas por estado en el Dashboard.
- Separar la informacion estructurada en pestañas dedicadas respondiendo a la navegacion:
  - **Ordenes**: Lista de ordenes con vista de detalle avanzado al hacer clic (informacion general, diagnostico, repuestos solicitados).
  - **Clientes**: Directorio completo en formato tabla con la informacion de contacto.
  - **Inventario**: Vista de tabla del stock actual mas un panel de repuestos solicitados recientemente por los mecanicos.

### `gtm/frontend/src/types.ts`

Archivo con tipos compartidos del frontend.

Define estructuras como:

- `Cliente`
- `WorkOrder`
- `InventoryItem`
- `UserRole`

Sirve para que TypeScript avise si se usan datos con una forma incorrecta.

### `gtm/frontend/src/data/mockData.ts`

Datos locales temporales para poder mostrar la interfaz aunque aun no todo venga desde backend.

En clientes, ahora funciona como respaldo si el backend no esta disponible.

## Flujo actual de clientes

El flujo implementado por ahora es:

```text
PostgreSQL -> NestJS GET /clientes -> React obtenerClientes() -> ReceptionPanel
ReceptionPanel -> React crearCliente() -> NestJS POST /clientes -> PostgreSQL
NestJS POST /vehiculos -> PostgreSQL, vinculando el vehiculo al cliente por RUT
```

Esto permite demostrar una API propia conectada a base de datos.

## Pendientes sugeridos

- Crear ordenes de trabajo en backend.
- Conectar la pantalla de vehiculos con la API de `POST /vehiculos`.
- Conectar recepcion con ordenes reales.
- Cambiar `DB_SYNCHRONIZE=true` por migraciones cuando el modelo se estabilice.
