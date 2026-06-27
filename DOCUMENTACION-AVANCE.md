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

- mantener el rol activo;
- mantener la seccion activa;
- cargar clientes, ordenes e inventario desde la API;
- crear clientes y ordenes usando la API;
- registrar movimientos de inventario;
- pasar datos y acciones a las vistas principales.

Antes `App.tsx` concentraba tambien las vistas grandes del sistema, lo que hacia dificil mantenerlo. Se realizo un refactor simple para mejorar la responsabilidad unica del frontend: `App.tsx` queda como coordinador y las pantallas quedan separadas en archivos propios.

### `gtm/frontend/src/components/Header.tsx`

Cabecera principal del panel. Muestra titulo, descripcion y botones principales de accion segun el rol activo.

### `gtm/frontend/src/views/AdminView.tsx`

Vista del administrador. Muestra resumen de ordenes, alerta de stock bajo, ordenes, clientes, inventario y repuestos solicitados.

### `gtm/frontend/src/views/ReceptionView.tsx`

Vista de recepcion. Agrupa el dashboard de recepcion, clientes, vehiculos y ordenes de trabajo.

### `gtm/frontend/src/views/MechanicView.tsx`

Vista del mecanico. Permite revisar ordenes asignadas, cambiar estados, ver detalles del vehiculo y solicitar repuestos.

### `gtm/frontend/src/views/InventoryView.tsx`

Vista del encargado de inventario. Agrupa listado de stock, stock bajo, movimientos y repuestos solicitados.

### `gtm/frontend/src/views/RoleDashboard.tsx`

Componente encargado de decidir que vista mostrar segun el rol activo. Esto evita que `App.tsx` tenga que contener directamente todas las pantallas.

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

## Patrones de diseno agregados

### Factory en ordenes de trabajo

Se agrego `gtm/src/ordenes-trabajo/ordenes-trabajo.factory.ts` para centralizar la creacion de ordenes de trabajo.

La factory crea una orden con los datos principales ya normalizados:

- cliente asociado;
- vehiculo asociado;
- tipo de servicio;
- diagnostico inicial;
- mecanico asignado;
- fecha de ingreso;
- estado inicial `Pendiente`.

Esto evita repetir la logica de construccion de una orden dentro del servicio y permite justificar un patron creacional dentro del proyecto.

Tambien se corrigio el registro de la factory en `gtm/src/ordenes-trabajo/ordenes-trabajo.module.ts`, ya que el modulo debe importar `OrdenTrabajoFactory`, que es el nombre real exportado por el archivo.

### Observer en inventario

Se agrego un Observer para detectar stock bajo cuando cambia el inventario.

Archivos agregados:

- `gtm/src/inventario/observadores/evento-stock-inventario.ts`
- `gtm/src/inventario/observadores/observador-inventario.interface.ts`
- `gtm/src/inventario/observadores/stock-bajo.observador.ts`

El flujo es:

```text
InventarioService actualiza stock
        ↓
notifica a los observadores registrados
        ↓
StockBajoObservador revisa si stock < minimo
        ↓
si corresponde, guarda una alerta de stock bajo
```

El endpoint agregado para revisar estas alertas es:

```text
GET /inventario/alertas-stock-bajo
```

El frontend tambien consume este endpoint desde `gtm/frontend/src/api/inventarioApi.ts` usando la funcion `obtenerAlertasStockBajo()`.

Las alertas se muestran como notificacion en el dashboard del administrador.

La seccion `Stock bajo` del rol de inventario no muestra la alerta repetida, porque esa pantalla ya lista directamente los repuestos con stock bajo.

Este patron permite que el servicio de inventario no tenga que conocer todos los efectos secundarios que pueden ocurrir despues de un cambio de stock. Por ahora solo existe el observador de stock bajo, pero mas adelante se podrian agregar otros observadores, por ejemplo para notificar al administrador, registrar auditoria o generar solicitudes de compra.

## Entrega 2 - Base de autenticacion y roles

Se inicio el bloque de seguridad creando la rama `feature/seguridad-finanzas-cierre`.

Dependencias agregadas:

- `@nestjs/jwt`: permite firmar y verificar tokens JWT.
- `bcryptjs`: permite guardar contrasenas y refresh tokens como hash, evitando guardar valores sensibles en texto plano.

Archivos principales agregados:

- `gtm/src/usuarios/usuario.entity.ts`: entidad `Usuario`, con nombre, correo, contrasena hasheada, rol, estado activo y refresh token hasheado.
- `gtm/src/usuarios/usuarios.service.ts`: administra busqueda de usuarios, validacion de contrasenas, almacenamiento de refresh tokens y usuarios iniciales.
- `gtm/src/usuarios/usuarios.module.ts`: registra el modulo de usuarios.
- `gtm/src/autenticacion/autenticacion.controller.ts`: expone endpoints de autenticacion.
- `gtm/src/autenticacion/autenticacion.service.ts`: contiene la logica de login, refresh token, perfil y logout.
- `gtm/src/autenticacion/guards/jwt-auth.guard.ts`: valida el access token enviado en `Authorization: Bearer`.
- `gtm/src/autenticacion/guards/roles.guard.ts`: base para restringir endpoints segun rol.
- `gtm/src/autenticacion/decorators/roles.decorator.ts`: decorador `@Roles()` para declarar roles permitidos.

Endpoints agregados:

```text
POST /auth/login
POST /auth/refresh
GET /auth/perfil
POST /auth/logout
```

Usuarios iniciales para desarrollo:

```text
admin@gtm.cl / Admin1234
recepcion@gtm.cl / Recepcion1234
mecanico@gtm.cl / Mecanico1234
inventario@gtm.cl / Inventario1234
```

Este avance deja lista la base para proteger posteriormente clientes, vehiculos, ordenes, inventario y pagos segun rol.

### Proteccion de endpoints por rol

Se aplicaron `JwtAuthGuard`, `RolesGuard` y el decorador `@Roles()` en los modulos principales del backend.

Permisos actuales:

```text
Clientes:
- Administrador
- Recepcionista

Vehiculos:
- Administrador
- Recepcionista

Ordenes de trabajo:
- Ver ordenes: Administrador, Recepcionista, Mecanico
- Crear ordenes: Administrador, Recepcionista
- Actualizar estado: Administrador, Recepcionista, Mecanico

Inventario:
- Administrador
- Inventario
```

Con esto, los endpoints principales ya no quedan abiertos publicamente: requieren un access token valido enviado en el header `Authorization: Bearer`.

Los endpoints de autenticacion siguen siendo publicos para permitir login y renovacion de sesion:

```text
POST /auth/login
POST /auth/refresh
```

### Login en frontend

Se agrego una pantalla de login en React para usar los usuarios reales creados en backend.

Archivos principales:

- `gtm/frontend/src/views/LoginView.tsx`: formulario de inicio de sesion y accesos de prueba por rol.
- `gtm/frontend/src/api/autenticacionApi.ts`: consumo de `POST /auth/login`, `POST /auth/refresh` y `POST /auth/logout`.
- `gtm/frontend/src/api/sesionApi.ts`: almacenamiento de access token, refresh token y usuario autenticado.

Cambios de comportamiento:

- Si no existe usuario autenticado, la aplicacion muestra el login.
- Al iniciar sesion, el rol visual se fija segun el rol real del usuario.
- Se bloquea el cambio manual de rol en el sidebar.
- Las llamadas a clientes, vehiculos, ordenes e inventario envian el header `Authorization: Bearer`.
- El sidebar muestra usuario activo y boton para cerrar sesion.

### Presupuesto de orden y descuentos

Se comenzo el bloque financiero agregando campos de presupuesto a las ordenes de trabajo:

- Costo de mano de obra.
- Costo de repuestos.
- Subtotal.
- Porcentaje y monto de descuento aplicado.
- Motivo del descuento.
- Total final.
- Adelanto requerido del 40%.
- Total pagado.
- Saldo pendiente.
- Estado de pago.

Tambien se agregaron datos comerciales al cliente para poder aplicar reglas de descuento:

- Cliente regular.
- Porcentaje de descuento por cliente regular.
- Membresia: Ninguna, Bronce, Plata u Oro.

El calculo de descuentos se implemento en el modulo `descuentos` usando el patron Strategy. Cada regla de descuento esta separada en una estrategia:

- `DescuentoMarcaStrategy`: aplica 5% si el vehiculo es Toyota o Mitsubishi.
- `DescuentoClienteRegularStrategy`: aplica el porcentaje configurado para clientes regulares.
- `DescuentoMembresiaStrategy`: aplica Bronce 10%, Plata 12.5% u Oro 15%.

El servicio `DescuentosService` evalua todas las estrategias y selecciona solo el descuento mas alto, cumpliendo la regla de negocio BR-4: los descuentos no se acumulan.

Con esto, al crear una orden de trabajo, el backend calcula automaticamente el presupuesto inicial y el adelanto minimo requerido.

### Gestion de pagos y cierre de ordenes

Se agrego el modulo `pagos` para registrar pagos asociados a una orden de trabajo.

Archivos principales:

- `gtm/src/pagos/pago.entity.ts`: representa la tabla `pagos`.
- `gtm/src/pagos/pagos.service.ts`: valida y registra pagos, actualizando el saldo de la orden.
- `gtm/src/pagos/pagos.controller.ts`: expone los endpoints del modulo.
- `gtm/src/pagos/dto/registrar-pago.dto.ts`: define los datos necesarios para registrar un pago.
- `gtm/src/pagos/dto/pago-respuesta.dto.ts`: define la respuesta entregada por la API.

Endpoints agregados:

```text
GET /pagos/orden/:ordenTrabajoId
POST /pagos
```

Reglas implementadas:

- El monto del pago debe ser mayor a cero.
- No se puede pagar una orden ya pagada.
- El pago no puede superar el saldo pendiente.
- El pago final debe cubrir todo el saldo pendiente.
- El primer pago debe cubrir al menos el adelanto requerido del 40%.
- Una orden no puede pasar a `En proceso` si no tiene pagado el adelanto.
- Una orden no puede pasar a `Entregada` si tiene saldo pendiente.
- Una orden debe estar `Finalizada` antes de marcarse como `Entregada`.

Con esto se avanza en las reglas BR-5 y BR-6, relacionadas con adelanto obligatorio y pago total antes de la entrega.

En frontend se agrego la seccion `Pagos` para el rol Recepcionista. Desde esta vista se puede seleccionar una orden con saldo pendiente, registrar adelanto, pago parcial o pago final, y ver total, adelanto requerido, pagado y saldo pendiente. Ademas, el formulario de apertura de orden ahora permite ingresar costo de mano de obra y costo de repuestos para que el presupuesto se calcule desde el backend.

Tambien se actualizo el formulario de clientes para registrar datos comerciales usados por las reglas de descuento: cliente regular, porcentaje de descuento regular y membresia. Esto permite demostrar desde la interfaz que el presupuesto de una orden aplica automaticamente el descuento mas alto disponible.

Se mejoro la visualizacion del presupuesto en frontend: la tabla de ordenes muestra total, descuento aplicado, estado de pago, monto pagado y saldo pendiente. La vista de pagos tambien muestra descuento y estado de pago al seleccionar una orden.

Se completo el flujo visual de cierre: cuando una orden esta `Finalizada` y sin saldo pendiente, la vista de pagos permite marcarla como `Entregada` desde recepcion.

Se amplio la vista de caja para que el recepcionista pueda buscar ordenes por numero de OT, RUT, patente o nombre del cliente. Al seleccionar una orden se muestra el resumen financiero completo, el estado del adelanto, el saldo pendiente, acciones rapidas para completar el adelanto o pagar el saldo final, y el historial de pagos registrados para esa orden. Esto hace mas claro el flujo de cierre y facilita demostrar las reglas BR-5 y BR-6 en la interfaz.

Se reforzo la seguridad del frontend agregando un helper comun para llamadas autenticadas. Las APIs de clientes, vehiculos, ordenes, inventario y pagos ahora intentan renovar automaticamente el access token usando el refresh token cuando reciben una respuesta `401`. Si la renovacion falla, la sesion local se limpia y el usuario vuelve al login. Esto hace mas estable el flujo con JWT + refresh tokens.

Se agrego gestion basica de usuarios para el rol Administrador. El backend expone endpoints protegidos para listar usuarios, crear nuevas cuentas y activar/desactivar accesos. En el frontend se agrego la seccion `Usuarios` en el panel administrador, permitiendo crear usuarios internos con rol Administrador, Recepcionista, Mecanico o Inventario. Esto fortalece el requisito de autenticacion y acceso por rol.

Tambien se agrego una validacion de cierre en el backend de pagos: no se pueden registrar pagos en ordenes `Entregada` o `Cancelada`. Con esto se evita modificar financieramente ordenes que ya terminaron su ciclo operativo.

Se ajusto el presupuesto de repuestos para que deje de ser manual. El inventario ahora maneja `precioUnitario` por repuesto y, al abrir una orden de trabajo, recepcion puede seleccionar repuestos y cantidades. El frontend calcula automaticamente el costo total de repuestos y lo envia al backend como parte del presupuesto de la orden. La mano de obra se mantiene manual por ahora, ya que mas adelante puede calcularse mediante tarifas por tipo de servicio o por horas trabajadas.

Se completo la integracion entre ordenes e inventario: al crear una orden con repuestos seleccionados, el backend calcula el costo de repuestos usando los precios del inventario y registra salidas automaticas para descontar el stock. Esto evita que el costo dependa de un valor escrito manualmente y deja trazabilidad en los movimientos de inventario.
