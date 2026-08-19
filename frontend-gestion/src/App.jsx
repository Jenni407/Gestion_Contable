import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  UserPlus, 
  FileCheck, 
  ExternalLink,
  Copy
} from 'lucide-react';

import Auth from './vistas/login/Login';
import DashboardLayout from './components/common/DashboardLayout';
import ClientesList from './vistas/clientes/ClientesList';
import ClienteForm from './components/forms/ClienteForm';
import UsuariosList from './vistas/usuarios/UsuariosList';
import DeclaracionPequenoContribuyente from './vistas/declaraciones/DeclaracionPequenoContribuyente';
import DeclaracionRegimenGeneral from './vistas/declaraciones/DeclaracionRegimenGeneral';
import DeclaracionPequenoContribuyenteList from './vistas/declaraciones/DeclaracionPequenoContribuyenteList';
import DeclaracionRegimenGeneralList from './vistas/declaraciones/DeclaracionRegimenGeneralList';
import ConsultaPublicaCliente from './vistas/publico/ConsultaPublicaCliente'; 

import CalendarioSAT from './components/ui/CalendarioSAT'; 

import { ClientesAPI, DeclaracionesAPI, setAuthToken } from './api/axiosConfig'; 
import './App.css';

function App() {
  const [usuario, setUsuario] = useState(() => {
    const savedUser = localStorage.getItem('usuario');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [seccion, setSeccion] = useState('inicio');
  const [clientes, setClientes] = useState([]);
  const [declaraciones, setDeclaraciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      const [resClientes, resDeclaraciones] = await Promise.allSettled([
        ClientesAPI.obtenerTodos(),
        DeclaracionesAPI.obtenerTodas()
      ]);

      if (resClientes.status === 'fulfilled') {
        const dataClientes = resClientes.value.data;
        const listaClientes = Array.isArray(dataClientes) 
          ? dataClientes 
          : (dataClientes?.content || []);
        setClientes(listaClientes);
      }

      if (resDeclaraciones.status === 'fulfilled') {
        const dataDeclaraciones = resDeclaraciones.value.data;
        const listaDeclaraciones = Array.isArray(dataDeclaraciones) 
          ? dataDeclaraciones 
          : (dataDeclaraciones?.content || []);
        setDeclaraciones(listaDeclaraciones);
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setAuthToken(token);
  }, []);

  useEffect(() => {
    if (usuario) cargarDatos();
  }, [usuario]);

  const handleLoginSuccess = (data) => {
    if (data.token) setAuthToken(data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario || data));
    setUsuario(data.usuario || data);
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  const copiarEnlaceConsulta = () => {
    const url = `${window.location.origin}/consulta`;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // --- FILTRADO FLEXIBLE DE RÉGIMEN DE CLIENTES ---
  const totalClientesPC = clientes.filter(c => {
    const reg = (
      c.regimenFiscal || 
      c.tipoRegimen || 
      c.regimen || 
      c.tipo || 
      c.tipoCliente || ''
    ).toString().toUpperCase();

    return reg.includes('PEQUEN') || reg.includes('PEQUEÑ') || reg === 'PC';
  }).length;

  const totalClientesGeneral = clientes.length - totalClientesPC;

  // --- CONTROL DE DECLARACIONES AL DÍA / OMISOS POR MES ACTUAL ---
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1; // 1 - 12
  const anioActual = fechaActual.getFullYear();

  // Helper para extraer ID de cliente de forma segura desde la declaración
  const obtenerIdCliente = (d) => 
    d.cliente?.idCliente ?? d.clienteId ?? d.cliente?.id ?? d.idCliente;

  // Helper para validar si la declaración está completada/presentada
  const esDeclaracionCompletada = (d) => {
    const est = (d.estadoSemaforo || d.estado || d.estadoDeclaracion || '').toString().toUpperCase();
    return (
      d.completada === true ||
      d.presentada === true ||
      d.pagado === true ||
      ['PRESENTADO', 'PRESENTADA', 'PAGADO', 'PAGADA', 'VERDE', 'COMPLETADO', 'COMPLETADA', 'AL DIA', 'AL DÍA'].includes(est) ||
      (d.fechaPresentacion && String(d.fechaPresentacion).trim() !== '')
    );
  };

  //declaración en el MES Y AÑO ACTUAL
  const clientesAlDiaMesActualSet = new Set(
    declaraciones
      .filter((d) => {
        const mesDec = Number(d.mesDeclarado || d.mes || (d.fechaPresentacion ? new Date(d.fechaPresentacion).getMonth() + 1 : null));
        const anioDec = Number(d.anioDeclarado || d.anio || (d.fechaPresentacion ? new Date(d.fechaPresentacion).getFullYear() : null));

        const esDelMesActual = mesDec === mesActual && anioDec === anioActual;
        return esDelMesActual && esDeclaracionCompletada(d);
      })
      .map(obtenerIdCliente)
      .filter((id) => id != null)
  );

  //Todo cliente registrado que NO esté en la lista de al día del mes actual
  const clientesOmisos = clientes.filter((c) => {
    const idCliente = c.idCliente ?? c.id;
    return idCliente != null && !clientesAlDiaMesActualSet.has(idCliente);
  }).length;

  const declaracionesCompletadas = clientesAlDiaMesActualSet.size;

  if (window.location.pathname === '/consulta') {
    return <ConsultaPublicaCliente />;
  }

  if (!usuario) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const esAdmin = usuario.rol === 'ADMINISTRADOR';

  return (
    <DashboardLayout 
      usuario={usuario} 
      onLogout={handleLogout}
      activeTab={seccion} 
      setActiveTab={setSeccion}
    >
      {/* VISTA DE INICIO */}
      {seccion === 'inicio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* BANNER DE ALERTA OMISOS CON BOTONES DIRECTOS */}
          {clientesOmisos > 0 && (
            <div style={{
              backgroundColor: '#fef2f2',
              borderLeft: '4px solid #ef4444',
              padding: '16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle color="#ef4444" size={24} />
                <div>
                  <strong style={{ color: '#991b1b', fontSize: '0.95rem' }}>Alerta de Omisos / Pendientes (Mes Actual)</strong>
                  <p style={{ color: '#7f1d1d', fontSize: '0.85rem', margin: 0 }}>
                    Hay <strong>{clientesOmisos}</strong> cliente(s) pendientes de presentar declaración este mes.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setSeccion('declaraciones-pc')}
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Declaraciones PC
                </button>
                <button 
                  onClick={() => setSeccion('declaraciones-general')}
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Declaraciones RG
                </button>
              </div>
            </div>
          )}

          {/* TARJETAS KPI DE MÉTRICAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
            
            <div className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Clientes Totales</span>
                <Users size={20} color="#2563eb" />
              </div>
              <h2 style={{ color: '#1e293b', marginTop: '10px', fontSize: '1.8rem' }}>{clientes.length}</h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {totalClientesPC} P. Contribuyente | {totalClientesGeneral} R. General
              </span>
            </div>

            <div className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Declaraciones Registradas</span>
                <FileText size={20} color="#0284c7" />
              </div>
              <h2 style={{ color: '#0284c7', marginTop: '10px', fontSize: '1.8rem' }}>{declaraciones.length}</h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Histórico total</span>
            </div>

            <div className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Al Día (Mes Actual)</span>
                <CheckCircle2 size={20} color="#16a34a" />
              </div>
              <h2 style={{ color: '#16a34a', marginTop: '10px', fontSize: '1.8rem' }}>{declaracionesCompletadas}</h2>
              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: '600' }}>Declaraciones presentadas</span>
            </div>

            <div className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Pendientes / Omisos</span>
                <AlertTriangle size={20} color="#dc2626" />
              </div>
              <h2 style={{ color: '#dc2626', marginTop: '10px', fontSize: '1.8rem' }}>{clientesOmisos}</h2>
              <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: '600' }}>Requieren atención</span>
            </div>

          </div>

          {/* ACCIONES FRECUENTES CON DIRECCIONAMIENTO A REPORTES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '16px' }}>Acciones Frecuentes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                
                <button onClick={() => setSeccion('nuevo-cliente')} style={btnQuickStyle}>
                  <UserPlus size={20} color="#2563eb" />
                  <span>Nuevo Cliente</span>
                </button>

                <button onClick={() => setSeccion('reporte-pc')} style={btnQuickStyle}>
                  <FileCheck size={20} color="#16a34a" />
                  <span>Reporte PC</span>
                </button>

                <button onClick={() => setSeccion('reporte-general')} style={btnQuickStyle}>
                  <FileCheck size={20} color="#0284c7" />
                  <span>Reporte RG</span>
                </button>

              </div>
            </div>

            {/* CONSULTA PÚBLICA */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <ExternalLink size={20} color="#2563eb" />
                  <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>Portal de Consulta de Clientes</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>
                  Enlace público para que los contribuyentes consulten su estado e imprenta sin ingresar al sistema.
                </p>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/consulta`}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    fontSize: '0.82rem',
                    color: '#475569'
                  }}
                />
                <button 
                  onClick={copiarEnlaceConsulta}
                  style={{
                    backgroundColor: copiado ? '#16a34a' : '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: '600'
                  }}
                >
                  <Copy size={14} />
                  {copiado ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

          </div>

          {/* CALENDARIO TRIBUTARIO INTERACTIVO */}
          <CalendarioSAT />

        </div>
      )}

      {/* RUTAS Y COMPONENTES */}
      {seccion === 'clientes' && <ClientesList clientes={clientes} onReload={cargarDatos} />}

      {seccion === 'nuevo-cliente' && (
        <ClienteForm 
          onSuccess={() => {
            cargarDatos(); 
            setSeccion('clientes');
          }} 
          onClose={() => setSeccion('clientes')} 
        />
      )}

      {(seccion === 'declaraciones-pc' || seccion === 'declaraciones') && (
        <DeclaracionPequenoContribuyente 
          clientes={clientes} 
          declaraciones={declaraciones} 
          onReload={cargarDatos} 
        />
      )}

      {seccion === 'declaraciones-general' && (
        <DeclaracionRegimenGeneral 
          clientes={clientes} 
          declaraciones={declaraciones} 
          onReload={cargarDatos} 
        />
      )}

      {seccion === 'reporte-pc' && (
        <DeclaracionPequenoContribuyenteList 
          declaraciones={declaraciones} 
        />
      )}

      {seccion === 'reporte-general' && (
        <DeclaracionRegimenGeneralList 
          declaraciones={declaraciones} 
        />
      )}

      {seccion === 'usuarios' && (
        esAdmin ? (
          <UsuariosList />
        ) : (
          <div className="card">
            <h3 style={{ color: '#ef4444' }}>Acceso Restringido</h3>
            <p style={{ marginTop: '8px', color: '#64748b' }}>
              No tienes permisos suficientes para acceder a la gestión de usuarios.
            </p>
          </div>
        )
      )}
    </DashboardLayout>
  );
}

const btnQuickStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '14px 10px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  color: '#334155',
  fontWeight: '600',
  fontSize: '0.82rem',
  cursor: 'pointer',
  textAlign: 'center'
};

export default App;