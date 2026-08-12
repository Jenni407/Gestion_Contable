import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import UsuarioFormModal from '../../components/forms/UsuarioForm';
import Boton from '../../components/ui/Boton';
import { PlusIcon } from '../../components/icons/Icons';

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);

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
      alert('No se pudo modificar el estado del usuario');
    }
  };

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
          {usuarios.map((u) => {
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