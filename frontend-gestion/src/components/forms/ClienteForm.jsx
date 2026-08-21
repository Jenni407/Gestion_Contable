import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { 
  EditIcon, 
  UserPlusIcon, 
  CloseIcon, 
  CheckSquareIcon 
} from '../icons/Icons';
import Boton from '../ui/Boton';
import Swal from 'sweetalert2';

const INITIAL_STATE = {
  nit: '',
  nombreRazonSocial: '',
  telefono: '', 
  regimenFiscal: 'Pequeño contribuyente',
  aplicaIvaGeneral: true,
  aplicaIsrt: false,
  aplicaRetencionIsr: false,
  fechaNacimiento: '',
  correoElectronico: '',
  estado: 'ACTIVO'
};

function FormField({ label, name, type = 'text', value, onChange, placeholder, required = false, maxLength, inputMode }) {
  return (
    <div className="form-group">
      <label>{label}:</label>
      <input
        type={type}
        name={name}
        value={value || ''} 
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        inputMode={inputMode}
      />
    </div>
  );
}

export default function ClienteFormModal({ clienteEditar, onClose, onSuccess }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!clienteEditar) {
      setFormData(INITIAL_STATE);
      return;
    }
    setFormData({
      nit: clienteEditar.nit || '',
      nombreRazonSocial: clienteEditar.nombreRazonSocial || clienteEditar.nombre || '',
      telefono: clienteEditar.telefono || clienteEditar.telefonoConfirmacion || clienteEditar.celular || '',
      regimenFiscal: clienteEditar.regimenFiscal || 'Pequeño contribuyente',
      aplicaIvaGeneral: clienteEditar.aplicaIvaGeneral ?? true,
      aplicaIsrt: clienteEditar.aplicaIsrt ?? false,
      aplicaRetencionIsr: clienteEditar.aplicaRetencionIsr ?? false,
      fechaNacimiento: clienteEditar.fechaNacimiento || '',
      correoElectronico: clienteEditar.correoElectronico || clienteEditar.correo || '',
      estado: clienteEditar.estado || 'ACTIVO'
    });
  }, [clienteEditar]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    // Restricción para NIT 
    if (name === 'nit' && typeof finalValue === 'string') {
      finalValue = finalValue.toUpperCase().replace(/[^0-9K]/g, '');
      if (finalValue.length > 13) return;
    }

    // Restricción para Teléfono 
    if (name === 'telefono' && typeof finalValue === 'string') {
      finalValue = finalValue.replace(/\D/g, '');
      if (finalValue.length > 8) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación previa al envío
    if (formData.telefono && formData.telefono.length < 8) {
      Swal.fire('Teléfono incompleto', 'El número de teléfono debe tener exactamente 8 dígitos.', 'warning');
      return;
    }

    setCargando(true);
    const id = clienteEditar?.idCliente || clienteEditar?.id;

    const payload = {
      ...formData,
      telefonoConfirmacion: formData.telefono
    };

    try {
      if (clienteEditar) {
        await api.put(`/clientes/${id}`, payload);
        await Swal.fire('Cliente actualizado', 'Los datos del cliente se guardaron correctamente.', 'success');
      } else {
        await api.post('/clientes', payload);
        await Swal.fire('Cliente registrado', 'El cliente se creó correctamente.', 'success');
      }

      if (onSuccess) await onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al guardar cliente:', err);
      Swal.fire('Error', 'Ocurrió un error al procesar el cliente.', 'error');
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
          <FormField 
            label="NIT" 
            name="nit" 
            value={formData.nit} 
            onChange={handleChange} 
            placeholder="Ej. 12345678" 
            maxLength={13} 
            required 
          />

          <FormField 
            label="Nombre o Razón Social" 
            name="nombreRazonSocial" 
            value={formData.nombreRazonSocial} 
            onChange={handleChange} 
            required 
          />
          
          <FormField 
            label="Teléfono / Celular" 
            name="telefono" 
            type="tel" 
            inputMode="numeric"
            placeholder="Ej. 55551234 (8 dígitos)" 
            value={formData.telefono} 
            onChange={handleChange} 
            maxLength={8}
            required 
          />

          <div className="form-group">
            <label>Régimen Fiscal:</label>
            <select name="regimenFiscal" value={formData.regimenFiscal || 'Pequeño contribuyente'} onChange={handleChange}>
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
                    <input type="checkbox" name={name} checked={!!formData[name]} onChange={handleChange} />
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
            <select name="estado" value={formData.estado || 'ACTIVO'} onChange={handleChange}>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          </div>

          {/* Acciones */}
          <div className="modal-actions">
            <Boton type="button" className="btn-secondary" onClick={onClose} disabled={cargando}>
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
