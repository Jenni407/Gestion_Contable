import React, { useState } from 'react';
import { Home, Users, UserPlus, FileText, FileCheck, Settings, LogOut, ChevronDown, ChevronRight } from 'lucide-react';

export default function DashboardLayout({ usuario, onLogout, activeTab, setActiveTab, children }) {
  const esAdmin = usuario?.rol === 'ADMINISTRADOR';

  // Estados para controlar los submenús desplegables
  const [subDeclaracionesAbierto, setSubDeclaracionesAbierto] = useState(true);
  const [subReportesAbierto, setSubReportesAbierto] = useState(true);

  return (
    <div className="dashboard-container">
      {/* Sidebar Lateral */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand" style={{ padding: '16px 12px', textAlign: 'center' }}>
            <img 
              src="/logo.png" 
              alt="Logo Oficina Contable" 
              style={{ 
                width: '100%', 
                maxWidth: '170px', 
                height: 'auto', 
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto'
              }} 
            />
          </div>

          <ul className="sidebar-menu">
            {/* INICIO */}
            <li 
              className={`sidebar-item ${activeTab === 'inicio' ? 'active' : ''}`} 
              onClick={() => setActiveTab('inicio')}
            >
              <Home size={18} className="sidebar-icon" />
              <span>Inicio</span>
            </li>

            {/* CLIENTES */}
            <li 
              className={`sidebar-item ${activeTab === 'clientes' ? 'active' : ''}`} 
              onClick={() => setActiveTab('clientes')}
            >
              <Users size={18} className="sidebar-icon" />
              <span>Clientes</span>
            </li>

            {/* CREAR CLIENTE */}
            <li 
              className={`sidebar-item ${activeTab === 'nuevo-cliente' ? 'active' : ''}`} 
              onClick={() => setActiveTab('nuevo-cliente')}
            >
              <UserPlus size={18} className="sidebar-icon" />
              <span>Crear Cliente</span>
            </li>
            
            {/* SUBMENÚ: DECLARACIONES */}
            <li 
              className="sidebar-item" 
              onClick={() => setSubDeclaracionesAbierto(!subDeclaracionesAbierto)}
              style={{ justifyContent: 'space-between', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} className="sidebar-icon" />
                <span>Declaraciones</span>
              </div>
              {subDeclaracionesAbierto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </li>

            {subDeclaracionesAbierto && (
              <ul style={{ listStyle: 'none', paddingLeft: '28px', margin: '4px 0' }}>
                <li 
                  className={`sidebar-item ${activeTab === 'declaraciones-pc' || activeTab === 'declaraciones' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('declaraciones-pc')}
                  style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                >
                  <span>• Pequeño Contribuyente</span>
                </li>
                <li 
                  className={`sidebar-item ${activeTab === 'declaraciones-general' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('declaraciones-general')}
                  style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                >
                  <span>• Régimen General</span>
                </li>
              </ul>
            )}

            {/* SUBMENÚ: REPORTES*/}
            <li 
              className="sidebar-item" 
              onClick={() => setSubReportesAbierto(!subReportesAbierto)}
              style={{ justifyContent: 'space-between', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCheck size={18} className="sidebar-icon" />
                <span>Reportes</span>
              </div>
              {subReportesAbierto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </li>

            {subReportesAbierto && (
              <ul style={{ listStyle: 'none', paddingLeft: '28px', margin: '4px 0' }}>
                <li 
                  className={`sidebar-item ${activeTab === 'reporte-pc' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('reporte-pc')}
                  style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                >
                  <span>• Pequeño Contribuyente</span>
                </li>
                <li 
                  className={`sidebar-item ${activeTab === 'reporte-general' || activeTab === 'reporte-declaraciones' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('reporte-general')}
                  style={{ fontSize: '0.88rem', padding: '8px 12px' }}
                >
                  <span>• Régimen General</span>
                </li>
              </ul>
            )}

            {/* USUARIOS */}
            {esAdmin && (
              <li 
                className={`sidebar-item ${activeTab === 'usuarios' ? 'active' : ''}`} 
                onClick={() => setActiveTab('usuarios')}
              >
                <Settings size={18} className="sidebar-icon" />
                <span>Usuarios</span>
              </li>
            )}
          </ul>
        </div>

        <div className="logout-box">
          <button className="btn-logout" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Área de Contenido */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-title">
            <h2>
              {activeTab === 'inicio' && 'Panel Principal'}
              {activeTab === 'clientes' && 'Gestión de Clientes'}
              {activeTab === 'nuevo-cliente' && 'Registro de Nuevo Cliente'}
              {(activeTab === 'declaraciones-pc' || activeTab === 'declaraciones') && 'Reporte Declaraciones - Pequeño Contribuyente'}
              {activeTab === 'declaraciones-general' && 'Declaraciones - Régimen General e ISR'}
              {activeTab === 'reporte-pc' && 'Reporte de Auditoría SAT-2046'}
              {(activeTab === 'reporte-general' || activeTab === 'reporte-declaraciones') && 'Reporte Declaraciones - Régimen General'}
              {activeTab === 'usuarios' && 'Administración de Usuarios'}
            </h2>
          </div>
          <div className="header-user-info">
            <span>Hola, <strong>{usuario?.nombre || 'Usuario'}</strong></span>
            <span className={`user-badge ${esAdmin ? 'admin' : 'contador'}`}>
              {usuario?.rol || 'CONTADOR'}
            </span>
          </div>
        </header>

        <div className="content-body">
          {children}
        </div>

        <footer className="main-footer">
          <p>© 2026 Oficina Contable. Todos los derechos reservados.</p>
          <div className="footer-links">
            <span>Soporte Técnico</span> • <span>Términos y Condiciones</span>
          </div>
        </footer>
      </main>
    </div>
  );
}