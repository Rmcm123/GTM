type OrderStatus = 'Pendiente' | 'En revision' | 'En proceso' | 'Finalizada';

type WorkOrder = {
  id: string;
  client: string;
  vehicle: string;
  mechanic: string;
  status: OrderStatus;
  checkIn: string;
};

const summaryCards = [
  {
    label: 'Cupos ocupados',
    value: '3 / 5',
    helper: 'Quedan 2 cupos disponibles',
    borderClass: 'border-t-[#2563eb]',
  },
  {
    label: 'Ordenes activas',
    value: '4',
    helper: 'Trabajos abiertos en el taller',
    borderClass: 'border-t-[#0f8a5f]',
  },
  {
    label: 'En revision',
    value: '1',
    helper: 'Vehiculo esperando diagnostico',
    borderClass: 'border-t-[#d48806]',
  },
  {
    label: 'Stock bajo',
    value: '2',
    helper: 'Repuestos bajo el minimo definido',
    borderClass: 'border-t-[#dc2626]',
  },
];

const workOrders: WorkOrder[] = [
  {
    id: 'OT-001',
    client: 'Juan Perez',
    vehicle: 'Toyota Corolla 2018',
    mechanic: 'Matias Rojas',
    status: 'En proceso',
    checkIn: '07/05/2026',
  },
  {
    id: 'OT-002',
    client: 'Maria Gomez',
    vehicle: 'Mitsubishi L200 2021',
    mechanic: 'Camila Torres',
    status: 'En revision',
    checkIn: '07/05/2026',
  },
  {
    id: 'OT-003',
    client: 'Carlos Ruiz',
    vehicle: 'Ford Ranger 2015',
    mechanic: 'Diego Silva',
    status: 'Pendiente',
    checkIn: '06/05/2026',
  },
  {
    id: 'OT-004',
    client: 'Ana Silva',
    vehicle: 'Chevrolet Spark 2019',
    mechanic: 'Camila Torres',
    status: 'Finalizada',
    checkIn: '05/05/2026',
  },
];

const inventoryItems = [
  { name: 'Aceite 10W-40', stock: 6, minimum: 8 },
  { name: 'Filtro de aire', stock: 3, minimum: 6 },
  { name: 'Bujias', stock: 14, minimum: 10 },
];

const workflow = [
  { status: 'Pendiente', count: 1 },
  { status: 'En revision', count: 1 },
  { status: 'En proceso', count: 1 },
  { status: 'Finalizada', count: 1 },
];

const statusClass: Record<OrderStatus, string> = {
  Pendiente: 'bg-[#fff7ed] text-[#9a4b00]',
  'En revision': 'bg-[#eaf2ff] text-[#1e55a8]',
  'En proceso': 'bg-[#e8f7ef] text-[#0d6848]',
  Finalizada: 'bg-[#e5f7f8] text-[#0f6872]',
};

function App() {
  const navItems = ['Dashboard', 'Ordenes', 'Clientes', 'Vehiculos', 'Inventario'];
  const occupiedSlots = 3;

  return (
    <div className="min-h-screen grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-10 px-4.6 py-3.5 xl:p-[24px_18px] bg-[#17211f] text-[#f7faf8] flex flex-col gap-3.5 xl:gap-6.5 xl:min-h-screen" aria-label="Navegacion principal">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 xl:w-12.5 xl:h-12.5 rounded-lg bg-[#f4c95d] text-[#17211f] grid place-items-center text-[18px] font-extrabold shrink-0">GTM</span>
          <div>
            <strong className="block text-[16px] leading-[1.2]">Taller Mecanico</strong>
            <span className="block text-[#b8c6c0] text-[13px]">Gestion de taller</span>
          </div>
        </div>

        <nav className="flex overflow-x-auto pb-0.5 xl:grid xl:gap-1.5">
          {navItems.map((item) => (
            <button 
              className={`w-auto flex-none min-w-26 text-center xl:w-full xl:min-h-10.5 border-0 rounded-[7px] bg-transparent text-[#d9e3de] cursor-pointer font-inherit text-[14px] xl:text-left px-3 py-2.5 hover:bg-white/10 hover:text-white transition-colors ${item === 'Dashboard' ? 'bg-white/10 text-white shadow-[inset_0_-4px_0_#f4c95d] xl:shadow-[inset_4px_0_0_#f4c95d]' : ''}`} 
              key={item} 
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="hidden xl:block mt-auto border border-white/10 rounded-lg[8px] p-3.5 bg-white/5">
          <span className="block text-[#b8c6c0] text-[13px]">Vista actual</span>
          <strong className="block my-1 text-[15px]">Entrega 1</strong>
          <small className="block text-[#b8c6c0] text-[13px]">Dashboard MVP</small>
        </div>
      </aside>

      <main className="min-w-0 p-3.5 md:p-4.5 xl:p-7">
        <header className="flex flex-col md:flex-row justify-between items-start gap-5 mb-5.5">
          <div>
            <span className="inline-block mb-1.5 text-[#64748b] text-[12px] font-bold tracking-wide uppercase">Panel principal</span>
            <h1 className="m-0 text-[#111827] leading-[1.15] text-[26px] md:text-[32px] font-extrabold">Dashboard GTM</h1>
            <p className="m-[8px_0_0] text-[#64748b] text-[14px]">Vista inicial para controlar cupos, ordenes activas y stock basico.</p>
          </div>
          <div className="flex flex-col max-[430px]:grid max-[430px]:w-full md:flex-row items-center justify-end gap-2.5 flex-wrap w-full md:w-auto">
            <button className="min-h-10 rounded-[7px] cursor-pointer text-[14px] font-bold px-3.5 border border-[#cbd5e1] bg-white text-[#1f2937] hover:bg-slate-50 w-full md:w-auto flex-1 md:flex-none justify-center" type="button">
              Registrar cliente
            </button>
            <button className="min-h-10 rounded-[7px] cursor-pointer text-[14px] font-bold px-3.5 border border-[#0f5b46] bg-[#0f6b52] text-white hover:bg-[#0c5943] w-full md:w-auto flex-1 md:flex-none justify-center" type="button">
              Nueva orden
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(160px,1fr))] gap-3.5 mb-4.5" aria-label="Indicadores principales">
          {summaryCards.map((card) => (
            <article className={`border border-[#dde5ee] rounded-lg[8px] bg-white shadow-[0_10px_24px_rgba(28,38,51,0.06)] min-h-31.5 p-3.5 md:p-4.5 border-t-4 ${card.borderClass}`} key={card.label}>
              <span className="text-[#64748b] text-[14px] block">{card.label}</span>
              <strong className="block m-[10px_0_8px] text-[#111827] text-[30px] leading-none">{card.value}</strong>
              <p className="m-[8px_0_0] text-[#64748b] text-[14px]">{card.helper}</p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4.5 items-start">
          <article className="border border-[#dde5ee] rounded-lg[8px] bg-white shadow-[0_10px_24px_rgba(28,38,51,0.06)] p-3.5 md:p-4.5 col-span-1 xl:col-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 mb-4.5">
              <div>
                <span className="inline-block mb-1.5 text-[#64748b] text-[12px] font-bold uppercase">Ordenes de trabajo</span>
                <h2 className="m-0 text-[#111827] leading-[1.15] text-[20px] font-extrabold">Ordenes activas</h2>
              </div>
              <button className="min-h-9 rounded-[7px] cursor-pointer text-[14px] font-bold px-3.5 border border-[#cbd5e1] bg-white text-[#1f2937] hover:bg-slate-50" type="button">
                Ver ordenes
              </button>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-180 border-collapse">
                <thead>
                  <tr>
                    {['OT', 'Cliente', 'Vehiculo', 'Mecanico', 'Estado', 'Ingreso'].map(th => (
                      <th key={th} className="border-b border-[#e5eaf0] p-[13px_10px] text-left align-middle bg-[#f8fafc] text-[#516071] text-[12px] font-extrabold uppercase">
                        {th}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-left align-middle text-[14px]">
                        <strong className="text-[#111827]">{order.id}</strong>
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-left align-middle text-[14px]">{order.client}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-left align-middle text-[14px]">{order.vehicle}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-left align-middle text-[14px]">{order.mechanic}</td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-left align-middle text-[14px]">
                        <span className={`inline-flex w-fit rounded-full px-2.5 py-1.5 text-[12px] font-extrabold ${statusClass[order.status]}`}>{order.status}</span>
                      </td>
                      <td className="border-b border-[#e5eaf0] p-[13px_10px] text-left align-middle text-[14px]">{order.checkIn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="grid gap-4.5">
            <article className="border border-[#dde5ee] rounded-lg[8px] bg-white shadow-[0_10px_24px_rgba(28,38,51,0.06)] p-3.5 md:p-4.5">
              <div className="flex items-center justify-between gap-3.5 mb-3">
                <div>
                  <span className="inline-block mb-1.5 text-[#64748b] text-[12px] font-bold uppercase">Capacidad</span>
                  <h2 className="m-0 text-[#111827] leading-[1.15] text-[20px] font-extrabold">Cupos del taller</h2>
                </div>
                <strong className="text-[#111827] text-[30px] leading-none">{occupiedSlots}/5</strong>
              </div>
              <div className="grid grid-cols-5 gap-2" aria-label="Cupos disponibles">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span className={`min-h-11 rounded-[7px] grid place-items-center font-extrabold ${index < occupiedSlots ? 'bg-[#0f6b52] text-white' : 'border border-dashed border-[#9bc9b6] bg-[#effaf4] text-[#0f6b52]'}`} key={index}>
                    {index + 1}
                  </span>
                ))}
              </div>
            </article>

            <article className="border border-[#dde5ee] rounded-lg[8px] bg-white shadow-[0_10px_24px_rgba(28,38,51,0.06)] p-3.5 md:p-4.5">
              <div className="flex items-center justify-between gap-3.5 mb-3">
                <div>
                  <span className="inline-block mb-1.5 text-[#64748b] text-[12px] font-bold uppercase">Flujo</span>
                  <h2 className="m-0 text-[#111827] leading-[1.15] text-[20px] font-extrabold">Estados de OT</h2>
                </div>
              </div>
              <div className="grid">
                {workflow.map((item, i) => (
                  <div className={`flex justify-between gap-3.5 py-3.5   ${i === 0 ? '' : 'border-t border-[#e5eaf0]'}`} key={item.status}>
                    <span className="text-[#64748b] text-[14px]">{item.status}</span>
                    <strong className="text-[#111827] text-[14px] font-bold">{item.count}</strong>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(280px,1fr)_320px] gap-4.5 mt-4.5">
          <article className="border border-[#dde5ee] rounded-lg[8px] bg-white shadow-[0_10px_24px_rgba(28,38,51,0.06)] p-3.5 md:p-4.5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 mb-3">
              <div>
                <span className="inline-block mb-1.5 text-[#64748b] text-[12px] font-bold uppercase">Inventario</span>
                <h2 className="m-0 text-[#111827] leading-[1.15] text-[20px] font-extrabold">Stock basico</h2>
              </div>
              <button className="min-h-9 rounded-[7px] cursor-pointer text-[14px] font-bold px-3.5 border border-[#cbd5e1] bg-white text-[#1f2937] hover:bg-slate-50" type="button">
                Ver inventario
              </button>
            </div>
            <div className="grid">
              {inventoryItems.map((item, i) => (
                <div className={`flex justify-between gap-3.5 py-3.5 ${i === 0 ? '' : 'border-t border-[#e5eaf0]'}`} key={item.name}>
                  <div className="grid gap-0.5">
                    <strong className="text-[#111827] text-[14px] font-bold">{item.name}</strong>
                    <span className="text-[#64748b] text-[14px]">Minimo: {item.minimum}</span>
                  </div>
                  {item.stock < item.minimum ? (
                    <span className="self-center whitespace-nowrap rounded-full bg-[#fff3df] text-[#9a4b00] font-extrabold px-2.25 py-1.25 text-[14px]">
                      {item.stock} unidades
                    </span>
                  ) : (
                    <span className="self-center whitespace-nowrap text-[#64748b] text-[14px]">{item.stock} unidades</span>
                  )}
                </div>
              ))}
            </div>
          </article>

          <article className="border border-[#dde5ee] rounded-lg[8px] bg-white shadow-[0_10px_24px_rgba(28,38,51,0.06)] p-3.5 md:p-4.5 grid gap-4">
            <div>
              <span className="inline-block mb-1.5 text-[#64748b] text-[12px] font-bold uppercase">Accesos</span>
              <h2 className="m-0 text-[#111827] leading-[1.15] text-[20px] font-extrabold">Operaciones principales</h2>
            </div>
            <div className="grid grid-cols-1 max-[430px]:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-2.5">
              {['Registrar cliente', 'Abrir OT', 'Cambiar estado', 'Actualizar stock'].map(action => (
                <button key={action} className="min-h-11 border border-[#cbd5e1] rounded-[7px] bg-[#f8fafc] text-[#1f2937] cursor-pointer font-inherit text-[14px] font-bold hover:bg-[#eef4f2] transition-colors" type="button">
                  {action}
                </button>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default App;
