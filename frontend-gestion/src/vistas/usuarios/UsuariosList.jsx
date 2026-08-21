import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import UsuarioFormModal from '../../components/forms/UsuarioForm';
import Boton from '../../components/ui/Boton';
import { PlusIcon } from '../../components/icons/Icons';
import Paginador from '../../components/common/Paginador';
import Swal from 'sweetalert2';

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [pagina, setPagina] = useState(1);

  const POR_PAGINA = 15;

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  const handleNuevoUsuario = () => {
    setUsuarioEditar(null);
    setModalAbierto(true);
  };

  const handleEditarUsuario = (usuario) => {
    setUsuarioEditar(usuario);
    setModalAbierto(true);
  };

  const handleToggleEstado = async (usuario) => {
    const id = usuario.id || usuario.idUsuario;
    const nuevoEstado = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    try {
      await api.put(`/usuarios/${id}`, {
        ...usuario,
        estado: nuevoEstado
      });
      cargarUsuarios();
    } catch (err) {
      console.error('Error al cambiar el estado:', err);
      Swal.fire('Error', 'No se pudo modificar el estado del usuario.', 'error');
    }
  };

  const totalPaginas = Math.ceil(usuarios.length / POR_PAGINA);
  const paginaSegura = Math.min(pagina, Math.max(totalPaginas, 1));
  const usuariosPagina = usuarios.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA);

  return (
    <div className="manager-card">
      <div className="header-actions">
        <div>
          <h2>Administración de Usuarios</h2>
          <p className="subtitle">Control de permisos, cambio de roles e inactivación de cuentas</p>
        </div>

        {/* Botón Nuevo Usuario */}
        <Boton 
          className="btn-primary" 
          onClick={handleNuevoUsuario} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusIcon />
          <span>Nuevo Usuario</span>
        </Boton>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>NOMBRE</th>
              <th>CORREO ELECTRÓNICO</th>
              <th>ROL ACTUAL</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {usuariosPagina.map((u) => {
              const id = u.id || u.idUsuario;
              const esActivo = u.estado === 'ACTIVO';

              return (
                <tr key={id}>
                  <td>{u.nombre}</td>
                  <td>{u.correoElectronico || u.correo}</td>
                  <td>
                    <strong>{u.rol}</strong>
                  </td>
                  <td>
                    <span className={`status-badge ${esActivo ? 'activo' : 'inactivo'}`}>
                      {u.estado || 'ACTIVO'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* Botón Editar */}
                      <Boton 
                        tipoAccion="editar" 
                        onClick={() => handleEditarUsuario(u)} 
                      />

                      {/* Botón Inactivar / Activar */}
                      <Boton 
                        tipoAccion={esActivo ? "inactivar" : "activar"} 
                        title={esActivo ? 'Inactivar Usuario' : 'Activar Usuario'}
                        onClick={() => handleToggleEstado(u)} 
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Paginador total={usuarios.length} porPagina={POR_PAGINA} pagina={paginaSegura} onCambiarPagina={setPagina} />

      {/* Modal Crear/Editar Usuario */}
      {modalAbierto && (
        <UsuarioFormModal
          usuarioEditar={usuarioEditar}
          onClose={() => setModalAbierto(false)}
          onSuccess={cargarUsuarios}
        />
      )}
    </div>
  );
}