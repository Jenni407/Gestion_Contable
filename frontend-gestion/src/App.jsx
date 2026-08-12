import { useState, useEffect } from 'react';
import Auth from './vistas/login/Login';
import DashboardLayout from './components/common/DashboardLayout';
import ClientesList from './vistas/clientes/ClientesList';
import ClienteForm from './components/forms/ClienteForm';
import UsuariosList from './vistas/usuarios/UsuariosList';
import DeclaracionPequenoContribuyente from './vistas/declaraciones/DeclaracionPequenoContribuyente';
import DeclaracionRegimenGeneral from './vistas/declaraciones/DeclaracionRegimenGeneral';
import DeclaracionPequenoContribuyenteList from './vistas/declaraciones/DeclaracionPequenoContribuyenteList';
import DeclaracionRegimenGeneralList from './vistas/declaraciones/DeclaracionRegimenGeneralList';

// IMPORTANTE: Se agrega setAuthToken aquí
import { ClientesAPI, DeclaracionesAPI, setAuthToken } from './api/axiosConfig'; 
import './App.css';

function App() {
  // Inicializa el usuario leyendo de localStorage si existe
  const [usuario, setUsuario] = useState(() => {
    const savedUser = localStorage.getItem('usuario');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [seccion, setSeccion] = useState('inicio');
  const [clientes, setClientes] = useState([]);
  const [declaraciones, setDeclaraciones] = useState([]);
  const [cargando, setCargando] = useState(false);

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
      } else {
        console.error('Error al obtener clientes:', resClientes.reason);
      }

      if (resDeclaraciones.status === 'fulfilled') {
        const dataDeclaraciones = resDeclaraciones.value.data;
        const listaDeclaraciones = Array.isArray(dataDeclaraciones) 
          ? dataDeclaraciones 
          : (dataDeclaraciones?.content || []);
        setDeclaraciones(listaDeclaraciones);
      } else {
        console.error('Error al obtener declaraciones:', resDeclaraciones.reason);
      }

    } catch (error) {
      console.error('Error general cargando información para el tablero:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuario) {
      cargarDatos();
    }
  }, [usuario, seccion]);

  // Manejador para login exitoso
  const handleLoginSuccess = (user) => {
    localStorage.setItem('usuario', JSON.stringify(user));
    setUsuario(user);
  };

  // Manejador para cerrar sesión de forma limpia
  const handleLogout = () => {
    setAuthToken(null);               // Borra el token de localStorage
    localStorage.removeItem('usuario'); // Borra la información de usuario
    setUsuario(null);                 // Regresa a la vista de Auth
  };

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
        <div>
          <div className="grid-3" style={{ marginBottom: '24px' }}>
            <div className="card">
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Clientes Activos</span>
              <h2 style={{ color: '#6b21a8', marginTop: '4px' }}>{clientes.length || 0}</h2>
            </div>
            <div className="card">
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Declaraciones Registradas</span>
              <h2 style={{ color: '#eab308', marginTop: '4px' }}>{declaraciones.length || 0}</h2>
            </div>
            <div className="card">
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Rol Actual</span>
              <h2 style={{ color: '#0284c7', marginTop: '4px' }}>{usuario.rol}</h2>
            </div>
          </div>
          <div className="card">
            <h3>Bienvenida a la Plataforma</h3>
            <p style={{ marginTop: '8px', color: '#64748b' }}>
              Selecciona una opción del menú lateral para comenzar a gestionar clientes o cuentas de usuarios.
            </p>
          </div>
        </div>
      )}

      {/* VISTA DE CLIENTES */}
      {seccion === 'clientes' && <ClientesList clientes={clientes} onReload={cargarDatos} />}

      {/* VISTA DE CREAR CLIENTE */}
      {seccion === 'nuevo-cliente' && (
        <ClienteForm 
          onSuccess={() => {
            cargarDatos(); 
            setSeccion('clientes');
          }} 
          onClose={() => setSeccion('clientes')} 
        />
      )}

      {/* MATRIZ PEQUEÑO CONTRIBUYENTE */}
      {(seccion === 'declaraciones-pc' || seccion === 'declaraciones') && (
        <DeclaracionPequenoContribuyente 
          clientes={clientes} 
          declaraciones={declaraciones} 
          onReload={cargarDatos} 
        />
      )}

      {/* MATRIZ RÉGIMEN GENERAL */}
      {seccion === 'declaraciones-general' && (
        <DeclaracionRegimenGeneral 
          clientes={clientes} 
          declaraciones={declaraciones} 
          onReload={cargarDatos} 
        />
      )}

      {/* REPORTE PEQUEÑO CONTRIBUYENTE */}
      {seccion === 'reporte-pc' && (
        <DeclaracionPequenoContribuyenteList 
          declaraciones={declaraciones} 
        />
      )}

      {/* REPORTE RÉGIMEN GENERAL */}
      {seccion === 'reporte-general' && (
        <DeclaracionRegimenGeneralList 
          declaraciones={declaraciones} 
        />
      )}

      {/* VISTA DE USUARIOS CON PROTECCIÓN */}
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

export default App;