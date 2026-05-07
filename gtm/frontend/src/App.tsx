import { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = [
    { title: 'Vehículos en Taller', value: "", color: '#3b82f6' },
    { title: 'Órdenes Pendientes', value: "", color: '#f59e0b' },
    { title: 'Trabajos Terminados (Hoy)', value: "", color: '#10b981' },
    { title: 'Ingresos del Día', value: '$', color: '#8b5cf6' },
  ];

  const recentOrders = [
    { id: 'ORD-001', client: 'Juan Pérez', vehicle: 'Toyota Corolla 2018', status: 'En progreso' },
    { id: 'ORD-002', client: 'María Gómez', vehicle: 'Honda Civic 2020', status: 'Esperando repuestos' },
    { id: 'ORD-003', client: 'Carlos Ruiz', vehicle: 'Ford Ranger 2015', status: 'Ingresado' },
    { id: 'ORD-004', client: 'Ana Silva', vehicle: 'Chevrolet Spark 2019', status: 'Ingresado' },
  ];

  return (
    <div className="dashboard-container">

      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>MTG</h2>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
             Panel de Control
          </button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
             Órdenes de Trabajo
          </button>
          <button className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>
             Clientes
          </button>
          <button className={activeTab === 'vehicles' ? 'active' : ''} onClick={() => setActiveTab('vehicles')}>
             Vehículos
          </button>
          <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>
             Inventario
          </button>
        </nav>
      </aside>

      
      <main className="main-content">
        <header className="topbar">
          <h1>Bienvenido</h1>
          <div className="user-profile"> Configuración</div>
        </header>

        <section className="dashboard-content">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card" style={{ borderTop: `4px solid ${stat.color}` }}>
                <h3>{stat.title}</h3>
                <p className="stat-value">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="recent-orders">
            <h2>Órdenes Recientes</h2>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID Orden</th>
                  <th>Cliente</th>
                  <th>Vehículo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.id}</td>
                    <td>{order.client}</td>
                    <td>{order.vehicle}</td>
                    <td>
                      <span className={`status-badge ${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-view">Ver Detalles</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
