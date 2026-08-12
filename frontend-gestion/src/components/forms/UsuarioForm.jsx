import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { EditIcon, UserPlusIcon, CloseIcon } from '../icons/Icons';
import Boton from '../ui/Boton';

export default function UsuarioFormModal({ usuarioEditar, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    correoElectronico: '',
    password: '',
    rol: 'CONTADOR',
    estado: 'ACTIVO'
  });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (usuarioEditar) {
      setFormData({
        nombre: usuarioEditar.nombre || '',
        correoElectronico: usuarioEditar.correoElectronico || usuarioEditar.correo || '',
        password: '',
        rol: usuarioEditar.rol || 'CONTADOR',
        estado: usuarioEditar.estado || 'ACTIVO'
      });
    }
  }, [usuarioEditar]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    const id = usuarioEditar?.id || usuarioEditar?.idUsuario;

    try {
      if (usuarioEditar) {
        await api.put(`/usuarios/${id}`, {
          ...usuarioEditar,
          ...formData,
          password: formData.password || usuarioEditar.password
        });
        alert('Usuario actualizado correctamente');
      } else {
        await api.post('/usuarios', formData);
        alert('Usuario registrado correctamente');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      alert('Ocurrió un error al procesar la solicitud');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {usuarioEditar ? (
              <>
                <EditIcon size={20} color="#2563EB" />
                <span>Editar Usuario #{usuarioEditar.id || usuarioEditar.idUsuario}</span>
              </>
            ) : (
              <>
                <UserPlusIcon size={20} color="#1E3A8A" />
                <span>Registrar Nuevo Usuario</span>
              </>
            )}
          </h3>
          <button 
            type="button" 
            className="close-btn" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            <CloseIcon size={20} color="#64748B" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Completo:</label>
            <input
              type="text"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Correo Electrónico:</label>
            <input
              type="email"
              name="correoElectronico"
              required
              value={formData.correoElectronico}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>{usuarioEditar ? 'Nueva Contraseña (dejar en blanco para conservar la actual):' : 'Contraseña:'}</label>
            <input
              type="password"
              name="password"
              required={!usuarioEditar}
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Rol:</label>
            <select name="rol" value={formData.rol} onChange={handleChange}>
              <option value="CONTADOR">CONTADOR</option>
              <option value="ADMINISTRADOR">ADMINISTRADOR</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estado:</label>
            <select name="estado" value={formData.estado} onChange={handleChange}>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          </div>

          <div className="modal-actions">
            <Boton type="button" className="btn-secondary" onClick={onClose} disabled={cargando}>
              Cancelar
            </Boton>
            <Boton type="submit" className="btn-primary" cargando={cargando} textoCargando="Guardando...">
              {usuarioEditar ? 'Actualizar Usuario' : 'Crear Usuario'}
            </Boton>
          </div>
        </form>
      </div>
    </div>
  );
}