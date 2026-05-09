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

Define los campos principales del cliente y su vehiculo:

- `rut`
- `nombre`
- `telefono`
- `correo`
- `patenteVehiculo`
- `vehiculo`

TypeORM usa esta clase para crear la tabla y consultar datos.

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
```

Sirve para que el frontend pueda pedir la lista de clientes guardados en PostgreSQL.

### `gtm/src/clientes/clientes.service.ts`

Servicio que contiene la logica para consultar clientes desde la base de datos.

Actualmente obtiene todos los clientes y los transforma a un formato de respuesta para no devolver directamente la entidad completa.

### `gtm/src/clientes/dto/cliente-respuesta.dto.ts`

Tipo que define la forma de los datos enviados al frontend cuando se consulta `GET /clientes`.

Ayuda a mantener claro que datos salen desde el backend.

### `gtm/database/semilla-clientes.sql`

Script SQL para insertar clientes iniciales en PostgreSQL.

Sirve para probar el sistema con datos reales sin tener todavia un formulario conectado a `POST /clientes`.

## Frontend

### `gtm/frontend/src/api/clientesApi.ts`

Archivo encargado de consumir la API de clientes del backend.

Contiene la funcion:

```ts
obtenerClientes()
```

Esta funcion hace un `fetch` a:

```text
http://localhost:3000/clientes
```

Asi el frontend deja de depender solamente de datos escritos en `mockData.ts`.

### `gtm/frontend/src/components/ReceptionPanel.tsx`

Panel visual de recepcion para registrar cliente y vehiculo.

Tambien muestra la lista de clientes recientes. Esa lista ahora puede venir desde el backend, y si la API falla se usan datos locales como respaldo.

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
- decidir que vista mostrar segun el rol

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
```

Esto permite demostrar una API propia conectada a base de datos.

## Pendientes sugeridos

- Crear `POST /clientes` para registrar clientes reales desde el formulario.
- Separar vehiculos en una tabla propia.
- Crear ordenes de trabajo en backend.
- Conectar recepcion con ordenes reales.
- Cambiar `DB_SYNCHRONIZE=true` por migraciones cuando el modelo se estabilice.
