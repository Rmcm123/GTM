import { useState } from 'react';
import { ActionPanel } from '../components/ActionPanel';
import { OrdersTable } from '../components/OrdersTable';
import { Panel } from '../components/Panel';
import { SummaryCards } from '../components/SummaryCards';
import { UsersPanel } from '../components/UsersPanel';
import { roleConfig } from '../data/mockData';
import type {
  AlertaStockBajo,
  Cliente,
  InventoryItem,
  RepuestoSolicitado,
  UsuarioSistema,
  WorkOrder,
} from '../types';

import type { ActualizarClientePayload } from '../api/clientesApi';
import type { CrearUsuarioPayload } from '../api/usuariosApi';

export function AdminView({
  activeSection,
  ordenes,
  repuestosSolicitados,
  clientes,
  inventario,
  alertasStockBajo,
  onNavigate,
  onActualizarCliente,
  guardandoClienteActualizado,
  mensajeFormulario,
  cargandoUsuarios,
  guardandoUsuario,
  mensajeUsuarios,
  onActualizarEstadoUsuario,
  onCrearUsuario,
  usuarios,
}: {
  activeSection: string;
  ordenes: WorkOrder[];
  repuestosSolicitados: RepuestoSolicitado[];
  clientes: Cliente[];
  inventario: InventoryItem[];
  alertasStockBajo: AlertaStockBajo[];
  onNavigate: (section: string) => void;
  onActualizarCliente?: (
    rut: string,
    cliente: ActualizarClientePayload,
  ) => Promise<boolean>;
  guardandoClienteActualizado?: boolean;
  mensajeFormulario?: string | null;
  cargandoUsuarios: boolean;
  guardandoUsuario: boolean;
  mensajeUsuarios: string | null;
  onActualizarEstadoUsuario: (
    usuarioId: string,
    activo: boolean,
  ) => Promise<boolean>;
  onCrearUsuario: (usuario: CrearUsuarioPayload) => Promise<boolean>;
  usuarios: UsuarioSistema[];
}) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editClientRut, setEditClientRut] = useState<string | null>(null);
  const [editClientForm, setEditClientForm] =
    useState<ActualizarClientePayload>({});

  const selectedOrder = ordenes.find((o) => o.id === selectedOrderId) || null;
  const repuestosOrden = selectedOrder
    ? repuestosSolicitados.filter((r) => r.ordenTrabajo === selectedOrder.id)
    : [];

  if (activeSection === 'Usuarios') {
    return (
      <UsersPanel
        cargandoUsuarios={cargandoUsuarios}
        guardandoUsuario={guardandoUsuario}
        mensajeUsuarios={mensajeUsuarios}
        onActualizarEstadoUsuario={onActualizarEstadoUsuario}
        onCrearUsuario={onCrearUsuario}
        usuarios={usuarios}
      />
    );
  }

  if (activeSection === 'Clientes') {
    return (
      <section className="grid grid-cols-1 items-start gap-[18px]">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">
                Directorio
              </span>
              <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">
                Todos los clientes
              </h2>
              <p className="m-[6px_0_0] text-[14px] text-[#64748b]">
                Listado completo de clientes registrados en el sistema.
              </p>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            {mensajeFormulario && (
              <div
                className={`mb-4 rounded-[7px] p-3 text-[14px] ${mensajeFormulario.includes('correctamente') ? 'bg-[#ecfdf5] text-[#047857]' : 'bg-[#fef2f2] text-[#b91c1c]'}`}
              >
                {mensajeFormulario}
              </div>
            )}
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  {['RUT', 'Nombre', 'Telefono', 'Correo', 'Acciones'].map(
                    (heading) => (
                      <th
                        className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-left text-[12px] font-extrabold uppercase text-[#516071]"
                        key={heading}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="border-b border-[#e5eaf0] p-[13px_10px] text-center text-[14px] text-[#64748b]"
                    >
                      No hay clientes registrados
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => (
                    <tr key={cliente.rut} className="hover:bg-slate-50">
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold text-[#111827]">
                        {cliente.rut}
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                        {editClientRut === cliente.rut ? (
                          <input
                            type="text"
                            value={editClientForm.nombre ?? cliente.nombre}
                            onChange={(e) =>
                              setEditClientForm({
                                ...editClientForm,
                                nombre: e.target.value,
                              })
                            }
                            className="w-full rounded border border-[#cbd5e1] p-1 text-[14px]"
                          />
                        ) : (
                          cliente.nombre
                        )}
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                        {editClientRut === cliente.rut ? (
                          <input
                            type="text"
                            value={editClientForm.telefono ?? cliente.telefono}
                            onChange={(e) =>
                              setEditClientForm({
                                ...editClientForm,
                                telefono: e.target.value,
                              })
                            }
                            className="w-full rounded border border-[#cbd5e1] p-1 text-[14px]"
                          />
                        ) : (
                          cliente.telefono
                        )}
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                        {editClientRut === cliente.rut ? (
                          <input
                            type="email"
                            value={editClientForm.correo ?? cliente.correo}
                            onChange={(e) =>
                              setEditClientForm({
                                ...editClientForm,
                                correo: e.target.value,
                              })
                            }
                            className="w-full rounded border border-[#cbd5e1] p-1 text-[14px]"
                          />
                        ) : (
                          cliente.correo
                        )}
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                        {editClientRut === cliente.rut ? (
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                if (onActualizarCliente) {
                                  const exito = await onActualizarCliente(
                                    cliente.rut,
                                    editClientForm,
                                  );
                                  if (exito) {
                                    setEditClientRut(null);
                                  }
                                }
                              }}
                              disabled={guardandoClienteActualizado}
                              className="rounded bg-[#0f6872] px-2 py-1 text-white hover:bg-[#0d5861] disabled:opacity-50"
                            >
                              {guardandoClienteActualizado
                                ? 'Guardando...'
                                : 'Guardar'}
                            </button>
                            <button
                              onClick={() => setEditClientRut(null)}
                              disabled={guardandoClienteActualizado}
                              className="rounded bg-gray-200 px-2 py-1 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditClientRut(cliente.rut);
                              setEditClientForm({
                                nombre: cliente.nombre,
                                telefono: cliente.telefono,
                                correo: cliente.correo,
                              });
                            }}
                            className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 font-medium"
                          >
                            Modificar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    );
  }

  if (activeSection === 'Inventario') {
    return (
      <section className="grid grid-cols-1 items-start gap-[18px]">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">
                Inventario
              </span>
              <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">
                Todos los repuestos
              </h2>
              <p className="m-[6px_0_0] text-[14px] text-[#64748b]">
                Listado completo de repuestos registrados en el sistema.
              </p>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  {['Nombre', 'Categoria', 'Stock', 'Minimo'].map((heading) => (
                    <th
                      className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-left text-[12px] font-extrabold uppercase text-[#516071]"
                      key={heading}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventario.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="border-b border-[#e5eaf0] p-[13px_10px] text-center text-[14px] text-[#64748b]"
                    >
                      No hay repuestos registrados
                    </td>
                  </tr>
                ) : (
                  inventario.map((item) => (
                    <tr
                      key={item.id || item.name}
                      className="hover:bg-slate-50"
                    >
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold text-[#111827]">
                        {item.name}
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                        {item.category}
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                        <span
                          className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[12px] font-extrabold ${item.stock < item.minimum ? 'bg-[#fef2f2] text-[#b91c1c]' : 'bg-[#e8f7ef] text-[#0d6848]'}`}
                        >
                          {item.stock}
                        </span>
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                        {item.minimum}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel>
          <div className="mb-3">
            <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">
              Solicitudes
            </span>
            <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">
              Repuestos solicitados
            </h2>
            <p className="m-[6px_0_0] text-[13px] text-[#64748b]">
              Listado de repuestos solicitados por mecanicos para reparaciones.
            </p>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  {[
                    'Repuesto',
                    'Cantidad',
                    'Mecanico',
                    'Orden de Trabajo',
                    'Fecha',
                    'Observaciones',
                  ].map((heading) => (
                    <th
                      className="border-b border-[#e5eaf0] bg-[#f8fafc] p-[13px_10px] text-left text-[12px] font-extrabold uppercase text-[#516071]"
                      key={heading}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {repuestosSolicitados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="border-b border-[#e5eaf0] p-[13px_10px] text-center text-[14px] text-[#64748b]"
                    >
                      No hay repuestos solicitados
                    </td>
                  </tr>
                ) : (
                  repuestosSolicitados.map((repuesto) => (
                    <tr key={repuesto.id} className="hover:bg-slate-50">
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold text-[#111827]">
                        {repuesto.nombre}
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                        {repuesto.cantidad}
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                        {repuesto.mecanico}
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px] font-bold">
                        {repuesto.ordenTrabajo}
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                        {repuesto.fecha}
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-[14px]">
                        {repuesto.observaciones || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    );
  }

  if (activeSection === 'Ordenes') {
    return (
      <section className="grid grid-cols-1 items-start gap-[18px]">
        <div className="grid gap-[18px]">
          <OrdersTable
            title="Todas las ordenes"
            helper="Haz clic en una fila para ver todos los detalles de la orden."
            orders={ordenes}
            actionLabel=""
            onRowClick={(order) =>
              setSelectedOrderId(order.id === selectedOrderId ? null : order.id)
            }
            selectedOrderId={selectedOrderId || undefined}
          />
          {selectedOrder && (
            <Panel>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">
                    Detalle de Orden
                  </span>
                  <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">
                    Orden {selectedOrder.id}
                  </h2>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1.5 text-[12px] font-extrabold ${
                    selectedOrder.status === 'En proceso'
                      ? 'bg-[#e8f7ef] text-[#0d6848]'
                      : selectedOrder.status === 'Finalizada'
                        ? 'bg-[#e5f7f8] text-[#0f6872]'
                        : selectedOrder.status === 'En revision'
                          ? 'bg-[#eaf2ff] text-[#1e55a8]'
                          : 'bg-[#fff7ed] text-[#9a4b00]'
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-[#e5eaf0] bg-[#f8fafc] p-4">
                  <h3 className="mb-2.5 text-[14px] font-extrabold text-[#111827]">
                    Datos Generales
                  </h3>
                  <div className="grid gap-1.5 text-[13px] text-[#475569]">
                    <p className="m-0">
                      <strong>Cliente:</strong> {selectedOrder.client}
                    </p>
                    <p className="m-0">
                      <strong>Vehiculo:</strong> {selectedOrder.vehicle}
                    </p>
                    <p className="m-0">
                      <strong>Mecanico asignado:</strong>{' '}
                      {selectedOrder.mechanic || 'Sin asignar'}
                    </p>
                    <p className="m-0">
                      <strong>Tipo de servicio:</strong>{' '}
                      {selectedOrder.tipoServicio || 'No especificado'}
                    </p>
                    <p className="m-0 border-t border-[#e5eaf0] pt-1.5 mt-1">
                      <strong>Fecha de Ingreso:</strong> {selectedOrder.checkIn}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-[#e5eaf0] bg-[#f8fafc] p-4">
                  <h3 className="mb-2.5 text-[14px] font-extrabold text-[#111827]">
                    Informacion Tecnica
                  </h3>
                  <div className="grid gap-1.5 text-[13px] text-[#475569]">
                    <p className="m-0">
                      <strong>Año:</strong>{' '}
                      {selectedOrder.año || 'No especificado'}
                    </p>
                    <p className="m-0">
                      <strong>Kilometraje:</strong>{' '}
                      {selectedOrder.kilometraje
                        ? `${selectedOrder.kilometraje.toLocaleString('es-CL')} km`
                        : 'No especificado'}
                    </p>
                  </div>
                </div>
                <div className="md:col-span-2 rounded-lg border border-[#e5eaf0] bg-[#f8fafc] p-4">
                  <h3 className="mb-1.5 text-[14px] font-extrabold text-[#111827]">
                    Diagnostico Inicial
                  </h3>
                  <p className="m-0 text-[13px] text-[#475569] whitespace-pre-wrap">
                    {selectedOrder.diagnosticoInicial ||
                      'Sin diagnostico inicial registrado.'}
                  </p>
                </div>
                {repuestosOrden.length > 0 && (
                  <div className="md:col-span-2 rounded-lg border border-[#e5eaf0] bg-[#f8fafc] p-4">
                    <h3 className="mb-2.5 text-[14px] font-extrabold text-[#111827]">
                      Repuestos Solicitados
                    </h3>
                    <ul className="m-0 grid gap-2 pl-4 text-[13px] text-[#475569]">
                      {repuestosOrden.map((repuesto) => (
                        <li key={repuesto.id}>
                          <strong>
                            {repuesto.cantidad}x {repuesto.nombre}
                          </strong>
                          {repuesto.observaciones
                            ? ` - ${repuesto.observaciones}`
                            : ''}
                          <span className="text-[#64748b]">
                            {' '}
                            (Solicitado el {repuesto.fecha})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Panel>
          )}
        </div>
      </section>
    );
  }

  const activasCount = ordenes.filter(
    (o) => !['Finalizada', 'Entregada', 'Cancelada'].includes(o.status),
  ).length;
  const revisionCount = ordenes.filter(
    (o) => o.status === 'En revision',
  ).length;
  const stockBajoCount =
    alertasStockBajo.length ||
    inventario.filter((i) => i.stock < i.minimum).length;

  const dynamicAdminSummary = [
    {
      label: 'Ordenes activas',
      value: activasCount.toString(),
      helper: 'Trabajos abiertos en el taller',
      borderClass: 'border-t-[#0f8a5f]',
    },
    {
      label: 'En revision',
      value: revisionCount.toString(),
      helper: 'Vehiculo esperando diagnostico',
      borderClass: 'border-t-[#d48806]',
    },
    {
      label: 'Stock bajo',
      value: stockBajoCount.toString(),
      helper: 'Repuestos bajo el minimo definido',
      borderClass: 'border-t-[#dc2626]',
    },
  ];

  return (
    <>
      <SummaryCards cards={dynamicAdminSummary} />
      {alertasStockBajo.length > 0 && (
        <div className="mb-[18px] rounded-[8px] border border-[#fecaca] bg-[#fef2f2] p-4">
          <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[12px] font-extrabold uppercase text-[#b91c1c]">
              Alerta stock bajo
            </span>
            <button
              className="w-fit rounded-[7px] border border-[#b91c1c] bg-white px-3 py-1.5 text-[13px] font-bold text-[#b91c1c] hover:bg-[#fff7f7]"
              onClick={() => onNavigate('Inventario')}
              type="button"
            >
              Ver inventario
            </button>
          </div>
          <div className="grid gap-1.5">
            {alertasStockBajo.slice(0, 3).map((alerta) => (
              <p
                className="m-0 text-[14px] font-bold text-[#111827]"
                key={alerta.repuestoId}
              >
                {alerta.mensaje}
              </p>
            ))}
            {alertasStockBajo.length > 3 && (
              <p className="m-0 text-[13px] font-bold text-[#7f1d1d]">
                +{alertasStockBajo.length - 3} repuestos adicionales con stock
                bajo
              </p>
            )}
          </div>
        </div>
      )}
      <section className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-[18px]">
          <Panel>
            <div className="mb-4">
              <span className="mb-1.5 inline-block text-[12px] font-bold uppercase text-[#64748b]">
                Flujo de trabajo
              </span>
              <h2 className="m-0 text-[20px] font-extrabold leading-[1.15] text-[#111827]">
                Estado de Ordenes
              </h2>
              <p className="m-[6px_0_0] text-[14px] text-[#64748b]">
                Monitor detallado de las ordenes segun su etapa actual.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Pendiente', 'En revision', 'En proceso', 'Finalizada'].map(
                (estado) => {
                  const ordenesEstado = ordenes.filter(
                    (o) => o.status === estado,
                  );
                  return (
                    <div
                      key={estado}
                      className="flex flex-col gap-2 rounded-lg border border-[#e5eaf0] bg-[#f8fafc] p-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#e5eaf0] pb-2">
                        <strong className="text-[14px] text-[#111827]">
                          {estado}
                        </strong>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[12px] font-bold text-[#64748b] border border-[#e5eaf0]">
                          {ordenesEstado.length}
                        </span>
                      </div>
                      {ordenesEstado.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {ordenesEstado.map((o) => (
                            <span
                              key={o.id}
                              className="inline-flex rounded bg-white px-2 py-1 text-[12px] font-bold text-[#0f6b52] border border-[#cbd5e1] shadow-sm"
                            >
                              {o.id}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#64748b] italic">
                          Sin ordenes
                        </span>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </Panel>
        </div>
        <div className="grid gap-[18px]">
          <ActionPanel
            actions={roleConfig.Administrador.actions}
            onAction={(action) => {
              if (action === 'Ver ordenes') onNavigate('Ordenes');
              else if (action === 'Ver inventario') onNavigate('Inventario');
              else if (action === 'Gestionar usuarios') onNavigate('Usuarios');
            }}
          />
        </div>
      </section>
    </>
  );
}
