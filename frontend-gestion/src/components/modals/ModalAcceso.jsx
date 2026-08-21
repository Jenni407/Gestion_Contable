import React, { useState } from 'react';
import { X, KeyRound, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import { useModalAccesos } from '../../hooks/useModalAcceso';
import './modalacceso.css';

const FORM_VACIO = { servicio: '', usuario: '', password: '', url: '', notas: '' };

export default function ModalAccesos({ cliente, onClose }) {
  const {
    credenciales,
    cargando,
    contraseñasVisibles,
    copiado,
    verContrasena,
    ocultarContrasena,
    copiarAlPortapapeles,
    guardar,
    eliminar
  } = useModalAccesos(cliente);

  const [form, setForm] = useState(null); // { datos, id } | null
  const [guardando, setGuardando] = useState(false);

  const abrirNuevo = () => setForm({ datos: { ...FORM_VACIO }, id: null });
  const abrirEditar = (c) => setForm({
    datos: {
      servicio: c.servicio || '',
      usuario: c.usuario || '',
      password: '',
      url: c.url || '',
      notas: c.notas || ''
    },
    id: c.id
  });
  const cerrarForm = () => setForm(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, datos: { ...prev.datos, [name]: value } }));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.datos.servicio?.trim()) {
      Swal.fire('Campo requerido', 'El servicio es obligatorio.', 'warning');
      return;
    }
    if (!form.id && !form.datos.password) {
      Swal.fire('Campo requerido', 'La contraseña es obligatoria para una credencial nueva.', 'warning');
      return;
    }
    setGuardando(true);
    try {
      const payload = { ...form.datos };
      if (!payload.password) delete payload.password; // no enviar contraseña vacía al editar
      await guardar(payload, form.id);
      cerrarForm();
    } catch (err) {
      console.error('Error al guardar credencial:', err);
      Swal.fire('Error', 'No se pudo guardar la credencial.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    const resultado = await Swal.fire({
      title: '¿Eliminar credencial?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    });
    if (!resultado.isConfirmed) return;
    try {
      await eliminar(id);
      Swal.fire('Eliminada', 'La credencial fue eliminada correctamente.', 'success');
    } catch (err) {
      console.error('Error al eliminar credencial:', err);
      Swal.fire('Error', 'No se pudo eliminar la credencial.', 'error');
    }
  };

  const nombreCliente = cliente?.nombre || cliente?.nombreRazonSocial || '';

  return (
    <div className="modal-backdrop">
      <div className="modal-box accesos-modal">
        <div className="modal-header">
          <div className="key-icon">
            <KeyRound size={20} color="#D97706" />
          </div>
          <h3>Credenciales - {nombreCliente}</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} color="#64748B" />
          </button>
        </div>

        <div className="modal-body">
          {form ? (
            <form onSubmit={handleGuardar} className="credential-form" noValidate>
              <h4>{form.id ? 'Editar credencial' : 'Nueva credencial'}</h4>

              <div className="form-group">
                <label>Servicio / Plataforma *</label>
                <input
                  name="servicio"
                  value={form.datos.servicio}
                  onChange={handleChange}
                  placeholder="Ej. SAT, FEL, Banca en línea"
                  required
                />
              </div>

              <div className="form-group">
                <label>Usuario / Cuenta</label>
                <input
                  name="usuario"
                  value={form.datos.usuario}
                  onChange={handleChange}
                  placeholder="Usuario de acceso"
                />
              </div>

              <div className="form-group">
                <label>Contraseña {form.id ? '(vacío = no cambiar)' : ''}</label>
                <input
                  name="password"
                  type="password"
                  value={form.datos.password}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  required={!form.id}
                />
              </div>

              <div className="form-group">
                <label>URL</label>
                <input
                  name="url"
                  value={form.datos.url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label>Notas</label>
                <textarea
                  name="notas"
                  value={form.datos.notas}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Notas opcionales"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" className="btn-secondary" onClick={cerrarForm} disabled={guardando}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <button type="button" className="btn-add-credential" onClick={abrirNuevo}>
                <Plus size={16} /> Agregar credencial
              </button>

              {cargando ? (
                <p className="empty-state">Cargando credenciales...</p>
              ) : credenciales.length === 0 ? (
                <p className="empty-state">Este cliente aún no tiene credenciales registradas.</p>
              ) : (
                <div className="credential-list">
                  {credenciales.map((c) => {
                    const visible = !!contraseñasVisibles[c.id];
                    return (
                      <div className="credential-item" key={c.id}>
                        <div className="credential-item__head">
                          <div className="credential-item__info">
                            <strong>{c.servicio}</strong>
                            {c.usuario && <span className="credential-item__user">{c.usuario}</span>}
                          </div>
                          <div className="credential-item__actions">
                            <button type="button" className="btn-action btn-edit" title="Editar" onClick={() => abrirEditar(c)}>
                              <Pencil size={16} />
                            </button>
                            <button type="button" className="btn-action btn-danger-icon" title="Eliminar" onClick={() => handleEliminar(c.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {c.url && <div className="credential-item__url">{c.url}</div>}
                        {c.notas && <div className="credential-item__notes">{c.notas}</div>}

                        <div className="credential-item__secret">
                          <input
                            type={visible ? 'text' : 'password'}
                            readOnly
                            value={c.password || ''}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            className="btn-action btn-key"
                            title={visible ? 'Ocultar' : 'Mostrar'}
                            onClick={() => (visible ? ocultarContrasena(c.id) : verContrasena(c.id))}
                          >
                            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button
                            type="button"
                            className="btn-copy"
                            onClick={() => copiarAlPortapapeles(c.id)}
                          >
                            {copiado === String(c.id) ? '¡Copiado!' : 'Copiar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
