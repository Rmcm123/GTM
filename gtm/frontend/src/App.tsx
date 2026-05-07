import './App.css';

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
    tone: 'blue',
  },
  {
    label: 'Ordenes activas',
    value: '4',
    helper: 'Trabajos abiertos en el taller',
    tone: 'green',
  },
  {
    label: 'En revision',
    value: '1',
    helper: 'Vehiculo esperando diagnostico',
    tone: 'amber',
  },
  {
    label: 'Stock bajo',
    value: '2',
    helper: 'Repuestos bajo el minimo definido',
    tone: 'red',
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
  Pendiente: 'status-pending',
  'En revision': 'status-review',
  'En proceso': 'status-process',
  Finalizada: 'status-done',
};

function App() {
  const navItems = ['Dashboard', 'Ordenes', 'Clientes', 'Vehiculos', 'Inventario'];
  const occupiedSlots = 3;

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegacion principal">
        <div className="brand">
          <span className="brand-mark">GTM</span>
          <div>
            <strong>Taller Mecanico</strong>
            <span>Gestion de taller</span>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button className={item === 'Dashboard' ? 'active' : ''} key={item} type="button">
              {item}
            </button>
          ))}
        </nav>

        <div className="session-card">
          <span>Vista actual</span>
          <strong>Entrega 1</strong>
          <small>Dashboard MVP</small>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Panel principal</span>
            <h1>Dashboard GTM</h1>
            <p>Vista inicial para controlar cupos, ordenes activas y stock basico.</p>
          </div>
          <div className="topbar-actions">
            <button className="secondary-button" type="button">
              Registrar cliente
            </button>
            <button className="primary-button" type="button">
              Nueva orden
            </button>
          </div>
        </header>

        <section className="summary-grid" aria-label="Indicadores principales">
          {summaryCards.map((card) => (
            <article className={`summary-card tone-${card.tone}`} key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.helper}</p>
            </article>
          ))}
        </section>

        <section className="dashboard-grid">
          <article className="panel orders-panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">Ordenes de trabajo</span>
                <h2>Ordenes activas</h2>
              </div>
              <button className="ghost-button" type="button">
                Ver ordenes
              </button>
            </div>

            <div className="table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>OT</th>
                    <th>Cliente</th>
                    <th>Vehiculo</th>
                    <th>Mecanico</th>
                    <th>Estado</th>
                    <th>Ingreso</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.id}</strong>
                      </td>
                      <td>{order.client}</td>
                      <td>{order.vehicle}</td>
                      <td>{order.mechanic}</td>
                      <td>
                        <span className={`status-pill ${statusClass[order.status]}`}>{order.status}</span>
                      </td>
                      <td>{order.checkIn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="side-stack">
            <article className="panel">
              <div className="panel-header compact">
                <div>
                  <span className="eyebrow">Capacidad</span>
                  <h2>Cupos del taller</h2>
                </div>
                <strong>{occupiedSlots}/5</strong>
              </div>
              <div className="bay-slots" aria-label="Cupos disponibles">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span className={index < occupiedSlots ? 'busy' : 'free'} key={index}>
                    {index + 1}
                  </span>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header compact">
                <div>
                  <span className="eyebrow">Flujo</span>
                  <h2>Estados de OT</h2>
                </div>
              </div>
              <div className="state-list">
                {workflow.map((item) => (
                  <div className="state-row" key={item.status}>
                    <span>{item.status}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </section>

        <section className="lower-grid">
          <article className="panel">
            <div className="panel-header compact">
              <div>
                <span className="eyebrow">Inventario</span>
                <h2>Stock basico</h2>
              </div>
              <button className="ghost-button" type="button">
                Ver inventario
              </button>
            </div>
            <div className="inventory-list">
              {inventoryItems.map((item) => (
                <div className={item.stock < item.minimum ? 'inventory-row low-stock' : 'inventory-row'} key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>Minimo: {item.minimum}</span>
                  </div>
                  <span>{item.stock} unidades</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel action-panel">
            <div>
              <span className="eyebrow">Accesos</span>
              <h2>Operaciones principales</h2>
            </div>
            <div className="action-grid">
              <button type="button">Registrar cliente</button>
              <button type="button">Abrir OT</button>
              <button type="button">Cambiar estado</button>
              <button type="button">Actualizar stock</button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default App;
