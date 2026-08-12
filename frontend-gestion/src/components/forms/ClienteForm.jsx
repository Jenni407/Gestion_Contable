import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { 
  EditIcon, 
  UserPlusIcon, 
  CloseIcon, 
  KeyIcon, 
  CheckSquareIcon 
} from '../icons/Icons';
import Boton from '../ui/Boton'; // Componente de botón reutilizable

const INITIAL_STATE = {
  nit: '',
  nombreRazonSocial: '',
  regimenFiscal: 'Pequeño contribuyente',
  aplicaIvaGeneral: true,
  aplicaIsrt: false,
  aplicaRetencionIsr: false,
  fechaNacimiento: '',
  correoElectronico: '',
  estado: 'ACTIVO',
  claveAV: '',
  claveFEL: '',
  claveCorreo: ''
};

function FormField({ label, name, type = 'text', value, onChange, placeholder, required = false }) {
  return (
    <div className="form-group">
      <label>{label}:</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

export default function ClienteFormModal({ clienteEditar, onClose, onSuccess }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!clienteEditar) return;
    const cred = clienteEditar.credencial || {};
    setFormData({
      nit: clienteEditar.nit || '',
      nombreRazonSocial: clienteEditar.nombreRazonSocial || clienteEditar.nombre || '',
      regimenFiscal: clienteEditar.regimenFiscal || 'Pequeño contribuyente',
      aplicaIvaGeneral: clienteEditar.aplicaIvaGeneral ?? true,
      aplicaIsrt: clienteEditar.aplicaIsrt ?? false,
      aplicaRetencionIsr: clienteEditar.aplicaRetencionIsr ?? false,
      fechaNacimiento: clienteEditar.fechaNacimiento || '',
      correoElectronico: clienteEditar.correoElectronico || clienteEditar.correo || '',
      estado: clienteEditar.estado || 'ACTIVO',
      claveAV: clienteEditar.claveAV || cred.passAgenciaVirtual || '',
      claveFEL: clienteEditar.claveFEL || cred.passFel || '',
      claveCorreo: clienteEditar.claveCorreo || cred.passCorreo || ''
    });
  }, [clienteEditar]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    const id = clienteEditar?.idCliente || clienteEditar?.id;

    const payload = {
      ...formData,
      credencial: {
        passAgenciaVirtual: formData.claveAV,
        passFel: formData.claveFEL,
        passCorreo: formData.claveCorreo
      }
    };

    try {
      if (clienteEditar) {
        await api.put(`/clientes/${id}`, payload);
        alert('Cliente y credenciales actualizados correctamente');
      } else {
        await api.post('/clientes', payload);
        alert('Cliente registrado correctamente');
      }

      if (onSuccess) await onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al guardar cliente:', err);
      alert('Ocurrió un error al procesar el cliente.');
    } finally {
      setCargando(false);
    }
  };

  const esRegimenGeneral = formData.regimenFiscal === 'Régimen General';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {clienteEditar ? (
              <>
                <EditIcon size={20} color="#2563EB" />
                <span>Editar Cliente #{clienteEditar.idCliente || clienteEditar.id}</span>
              </>
            ) : (
              <>
                <UserPlusIcon size={20} />
                <span>Registrar Nuevo Cliente</span>
              </>
            )}
          </h3>
          <button 
            type="button" 
            className="close-btn" 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Datos principales */}
          <FormField label="NIT" name="nit" value={formData.nit} onChange={handleChange} required />
          <FormField label="Nombre o Razón Social" name="nombreRazonSocial" value={formData.nombreRazonSocial} onChange={handleChange} required />

          <div className="form-group">
            <label>Régimen Fiscal:</label>
            <select name="regimenFiscal" value={formData.regimenFiscal} onChange={handleChange}>
              <option value="Pequeño contribuyente">Pequeño contribuyente</option>
              <option value="Régimen General">Régimen General</option>
            </select>
          </div>

          {/* Opciones Régimen General */}
          {esRegimenGeneral && (
            <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '6px', border: '1px solid #bae6fd', marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <CheckSquareIcon size={16} />
                <span>IMPUESTOS APLICABLES (RÉGIMEN GENERAL)</span>
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
                {[
                  { name: 'aplicaIvaGeneral', label: 'IVA General (SAT-2237)' },
                  { name: 'aplicaIsrt', label: 'ISR Trimestral (SAT-1361)' },
                  { name: 'aplicaRetencionIsr', label: 'Retenciones ISR (SAT-1331)' }
                ].map(({ name, label }) => (
                  <label key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" name={name} checked={formData[name]} onChange={handleChange} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <FormField label="Fecha de Nacimiento" name="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={handleChange} />
          <FormField label="Correo Electrónico" name="correoElectronico" type="email" value={formData.correoElectronico} onChange={handleChange} required />

          <div className="form-group">
            <label>Estado:</label>
            <select name="estado" value={formData.estado} onChange={handleChange}>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          </div>

          <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

          {/* Sección Bóveda */}
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyIcon size={18} color="#D97706" />
            <span>Bóveda de contraseñas</span>
          </h4>

          {[
            { name: 'claveAV', label: 'Clave Agencia Virtual', placeholder: 'Ingresar clave ' },
            { name: 'claveFEL', label: 'Clave FEL', placeholder: 'Ingresar clave FEL ' },
            { name: 'claveCorreo', label: 'Clave Correo Electrónico', placeholder: 'Ingresar clave de correo' }
          ].map(({ name, label, placeholder }) => (
            <FormField
              key={name}
              label={label}
              name={name}
              type="password"
              value={formData[name]}
              onChange={handleChange}
              placeholder={placeholder}
            />
          ))}

          {/* Acciones reutilizando componente Boton */}
          <div className="modal-actions">
            <Boton className="btn-secondary" onClick={onClose} disabled={cargando}>
              Cancelar
            </Boton>
            <Boton type="submit" className="btn-primary" cargando={cargando} textoCargando="Guardando...">
              {clienteEditar ? 'Actualizar Cliente' : 'Crear Cliente'}
            </Boton>
          </div>
        </form>
      </div>
    </div>
  );
}