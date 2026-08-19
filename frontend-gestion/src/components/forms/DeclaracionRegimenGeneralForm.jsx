import { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Calendar, 
  Hash, 
  CheckCircle2, 
  Upload,
  MessageSquare, 
  Receipt,
  FileCheck,
  X
} from 'lucide-react';
import Swal from "sweetalert2";
import { FileTextIcon, CloseIcon } from '../icons/Icons';
import Boton from '../ui/Boton';
import { DeclaracionesAPI } from '../../api/axiosConfig'; 
import '../../vistas/declaraciones/declaraciones.css'; 

export default function DeclaracionRegimenGeneralForm({ isOpen, clientes = [], datosIniciales, onClose, onSave }) {
  // Referencia para activar el input de archivo oculto
  const fileInputRef = useRef(null);

  const [clienteId, setClienteId] = useState(
    datosIniciales?.cliente?.idCliente || datosIniciales?.cliente?.id || ''
  );
  const [tipoImpuesto, setTipoImpuesto] = useState(
    datosIniciales?.declaracionExistente?.tipoImpuesto || 'IVA_GENERAL'
  );
  const [anio, setAnio] = useState(datosIniciales?.anio || new Date().getFullYear());
  const [mes, setMes] = useState(datosIniciales?.mes || 1);
  const [numeroFormularioSat, setNumeroFormularioSat] = useState(
    datosIniciales?.declaracionExistente?.numeroFormularioSat || ''
  );
  const [estadoSemaforo, setEstadoSemaforo] = useState(
    datosIniciales?.declaracionExistente?.estadoSemaforo || 'PRESENTADO'
  );
  const [observaciones, setObservaciones] = useState(
    datosIniciales?.declaracionExistente?.observacionesBitacora || ''
  );
  const [fechaPresentacion, setFechaPresentacion] = useState(
    datosIniciales?.declaracionExistente?.fechaPresentacion || new Date().toISOString().split('T')[0]
  );
  const [rutaComprobantePdf, setRutaComprobantePdf] = useState(
    datosIniciales?.declaracionExistente?.rutaComprobantePdf || ''
  );
  const [archivoPdf, setArchivoPdf] = useState(null);
  const [cargando, setCargando] = useState(false);

  const esEdicion = Boolean(
    datosIniciales?.declaracionExistente &&
    (datosIniciales.declaracionExistente.id || datosIniciales.declaracionExistente.idDeclaracion)
  );

  const clienteSeleccionado = clientes.find(c => (c.idCliente || c.id) === Number(clienteId));

  useEffect(() => {
    if (datosIniciales?.cliente) {
      setClienteId(datosIniciales.cliente.idCliente || datosIniciales.cliente.id || '');
    }
    if (datosIniciales?.anio) setAnio(datosIniciales.anio);
    if (datosIniciales?.mes) setMes(datosIniciales.mes);
    
    if (datosIniciales?.declaracionExistente) {
      setTipoImpuesto(datosIniciales.declaracionExistente.tipoImpuesto || 'IVA_GENERAL');
      setNumeroFormularioSat(datosIniciales.declaracionExistente.numeroFormularioSat || '');
      setEstadoSemaforo(datosIniciales.declaracionExistente.estadoSemaforo || 'PRESENTADO');
      setObservaciones(datosIniciales.declaracionExistente.observacionesBitacora || '');
      setFechaPresentacion(
        datosIniciales.declaracionExistente.fechaPresentacion || new Date().toISOString().split('T')[0]
      );
      setRutaComprobantePdf(datosIniciales.declaracionExistente.rutaComprobantePdf || '');
    } else {
      setTipoImpuesto('IVA_GENERAL');
      setNumeroFormularioSat('');
      setEstadoSemaforo('PRESENTADO');
      setObservaciones('');
      setFechaPresentacion(new Date().toISOString().split('T')[0]);
      setRutaComprobantePdf('');
    }
    setArchivoPdf(null);
  }, [datosIniciales]);

  if (!isOpen) return null;

  // Manejador que restringe la entrada a SOLO NÚMEROS y máximo 11 caracteres
  const handleNumeroFormularioChange = (e) => {
    const soloNumeros = e.target.value.replace(/\D/g, ''); 
    if (soloNumeros.length <= 11) {
      setNumeroFormularioSat(soloNumeros);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clienteId) {
      Swal.fire('Por favor selecciona un cliente del Régimen General.');
      return;
    }

    if (numeroFormularioSat && numeroFormularioSat.length < 11) {
      Swal.fire('Atención', 'El número de formulario SAT debe contener exactamente 11 dígitos.', 'warning');
      return;
    }

    setCargando(true);
    const esPresentado = estadoSemaforo === 'PRESENTADO';

    const payloadDeclaracion = {
      cliente: {
        idCliente: Number(clienteId)
      },
      anio: Number(anio),
      mes: Number(mes),
      tipoImpuesto: tipoImpuesto,
      estadoSemaforo: estadoSemaforo,
      numeroFormularioSat: numeroFormularioSat || null,
      fechaPresentacion: esPresentado ? fechaPresentacion : null,
      observacionesBitacora: observaciones || null,
      rutaComprobantePdf: rutaComprobantePdf || null
    };

    try {
      // 1. Guardar metadatos en JSON
      const res = await DeclaracionesAPI.guardar(payloadDeclaracion);
      const declaracionGuardada = res.data?.declaracion || res.data;
      const idDeclaracionFinal = declaracionGuardada?.idDeclaracion || declaracionGuardada?.id;

      // 2. Subir el comprobante PDF si fue adjuntado
      if (archivoPdf && idDeclaracionFinal) {
        const formData = new FormData();
        formData.append('idDeclaracion', idDeclaracionFinal);
        formData.append('archivo', archivoPdf);

        await DeclaracionesAPI.subirComprobante(formData);
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Error al guardar declaración del Régimen General:', err);
      Swal.fire('Error al guardar la declaración.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        <div className="modal-header">
          <h2 className="modal-title">
            <FileTextIcon size={22} color="#2563EB" />
            {esEdicion ? 'Editar Declaración' : 'Registrar Declaración'}
          </h2>
          <button type="button" onClick={onClose} className="btn-cerrar-modal">
            <CloseIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="declaracion-form">
          
          <div className="form-group">
            <label>
              <User size={16} /> Cliente (Régimen General)
            </label>
            <select 
              name="clienteId"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              required
              className="form-control"
            >
              <option value="">-- Seleccione un Cliente ({clientes.length} disponibles) --</option>
              {clientes.map((c) => {
                const id = c.idCliente || c.id;
                const nombre = c.nombreRazonSocial || c.nombre || c.razonSocial || `Cliente ${id}`;
                const nit = c.nit ? ` - NIT: ${c.nit}` : '';

                return (
                  <option key={id} value={id}>
                    {nombre} {nit}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label>
              <Receipt size={16} /> Tipo de Impuesto / Formulario 
            </label>
            <select
              value={tipoImpuesto}
              onChange={(e) => setTipoImpuesto(e.target.value)}
              className="form-control"
              required
            >
              {clienteSeleccionado ? (
                <>
                  {clienteSeleccionado.aplicaIvaGeneral && <option value="IVA_GENERAL">IVA General</option>}
                  {clienteSeleccionado.aplicaIsrt && <option value="ISR_TRIMESTRAL">ISR Trimestral</option>}
                  {clienteSeleccionado.aplicaRetencionIsr && <option value="RETENCION_ISR">Retenciones ISR</option>}

                  {!clienteSeleccionado.aplicaIvaGeneral && !clienteSeleccionado.aplicaIsrt && !clienteSeleccionado.aplicaRetencionIsr && (
                    <>
                      <option value="IVA_GENERAL">IVA General</option>
                      <option value="ISR_TRIMESTRAL">ISR Trimestral</option>
                      <option value="RETENCION_ISR">Retenciones ISR</option>
                    </>
                  )}
                </>
              ) : (
                <>
                  <option value="IVA_GENERAL">IVA General</option>
                  <option value="ISR_TRIMESTRAL">ISR Trimestral</option>
                  <option value="RETENCION_ISR">Retenciones ISR</option>
                </>
              )}
            </select>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group flex-1" style={{ flex: 1 }}>
              <label>
                <Calendar size={16} /> Año
              </label>
              <input 
                type="number" 
                value={anio} 
                onChange={(e) => setAnio(e.target.value)} 
                required 
                className="form-control" 
              />
            </div>
            <div className="form-group flex-1" style={{ flex: 1 }}>
              <label>
                <Calendar size={16} /> Mes (1 - 12)
              </label>
              <input 
                type="number" 
                min="1" 
                max="12" 
                value={mes} 
                onChange={(e) => setMes(e.target.value)} 
                required 
                className="form-control" 
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <CheckCircle2 size={16} /> Estado
            </label>
            <select 
              value={estadoSemaforo} 
              onChange={(e) => setEstadoSemaforo(e.target.value)} 
              className="form-control"
            >
              <option value="PRESENTADO">🟢 Presentado y Pagado</option>
              <option value="EN_PROCESO">🟡 En Proceso / En Papelería</option>
              <option value="PENDIENTE">🔴 Omiso / Pendiente de Presentación</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <Hash size={16} /> Número de Formulario 
            </label>
            <input 
              type="text" 
              inputMode="numeric"
              placeholder="Ej: 20260811001" 
              value={numeroFormularioSat} 
              onChange={handleNumeroFormularioChange} 
              maxLength={11}
              className="form-control" 
            />
          </div>

          {/* CAMPOS PARA ADJUNTAR */}
          {estadoSemaforo === 'PRESENTADO' && (
            <>
              <div className="form-group">
                <label>
                  <Calendar size={16} /> Fecha de Presentación
                </label>
                <input 
                  type="date" 
                  value={fechaPresentacion} 
                  onChange={(e) => setFechaPresentacion(e.target.value)} 
                  required
                  className="form-control" 
                />
              </div>

              {/* Adjuntar Archivo PDF Local */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={16} /> Adjuntar Comprobante (PDF)
                </label>

                {/* Input File Oculto */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="application/pdf"
                  onChange={(e) => setArchivoPdf(e.target.files[0] || null)} 
                  style={{ display: 'none' }}
                />

                {/* Si NO hay archivo cargado: Muestra botón */}
                {!archivoPdf ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#56076e',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginTop: '4px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    <Upload size={16} />
                    <span>Elegir archivo PDF</span>
                  </button>
                ) : (
                  /* Si SÍ hay archivo: Muestra el indicador con nombre y botón para remover */
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    marginTop: '4px'
                  }}>
                    <FileCheck size={18} color="#16a34a" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#15803d', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {archivoPdf.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setArchivoPdf(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Quitar archivo"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <label>
              <MessageSquare size={16} /> Observaciones
            </label>
            <textarea 
              value={observaciones} 
              onChange={(e) => setObservaciones(e.target.value)} 
              rows="3" 
              className="form-control textarea-control"
            ></textarea>
          </div>

          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <Boton 
              type="button" 
              onClick={onClose} 
              className="btn-cancelar"
              disabled={cargando}
            >
              Cancelar
            </Boton>
            <Boton 
              type="submit" 
              className="btn-guardar"
              cargando={cargando} 
              textoCargando="Guardando..."
            > 
              Guardar Formulario
            </Boton>
          </div>

        </form>
      </div>
    </div>
  );
}