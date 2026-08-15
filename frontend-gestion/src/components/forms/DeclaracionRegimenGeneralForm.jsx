import React, { useState, useEffect } from 'react';
import { User, Calendar, Hash, CheckCircle2, Link, MessageSquare, Receipt } from 'lucide-react';
import { FileTextIcon, CloseIcon } from '../icons/Icons';
import Boton from '../ui/Boton';
import { DeclaracionesAPI } from '../../api/axiosConfig'; 
import '../../vistas/declaraciones/declaraciones.css'; 

export default function DeclaracionRegimenGeneralForm({ isOpen, clientes = [], datosIniciales, onClose, onSave }) {
  if (!isOpen) return null;

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
  const [cargando, setCargando] = useState(false);

  // Verificación 
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
  }, [datosIniciales]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clienteId) {
      alert('Por favor selecciona un cliente del Régimen General.');
      return;
    }

    setCargando(true);
    const esPresentado = estadoSemaforo === 'PRESENTADO';

    const payload = {
      cliente: { idCliente: Number(clienteId) },
      tipoImpuesto: tipoImpuesto,
      anio: Number(anio),
      mes: Number(mes),
      estadoSemaforo: estadoSemaforo,
      numeroFormularioSat: numeroFormularioSat || null,
      fechaPresentacion: esPresentado ? fechaPresentacion : null,
      rutaComprobantePdf: esPresentado && rutaComprobantePdf ? rutaComprobantePdf : null,
      observacionesBitacora: observaciones || null
    };

    try {
      await DeclaracionesAPI.guardar(payload);
      onSave();
      onClose();
    } catch (err) {
      console.error('Error al guardar declaración:', err);
      alert('Error al guardar la declaración.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Encabezado */}
        <div className="modal-header">
          <h2 className="modal-title">
            <FileTextIcon size={22} color="#2563EB" />
            {esEdicion ? 'Editar Declaración' : 'Registrar Declaración'}
          </h2>
          <button type="button" onClick={onClose} className="btn-cerrar-modal">
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="declaracion-form">
          
          {/* Selección de Cliente */}
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

          {/* Selección de Tipo de Impuesto */}
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
                  {clienteSeleccionado.aplicaIvaGeneral && <option value="IVA_GENERAL">IVA General </option>}
                  {clienteSeleccionado.aplicaIsrt && <option value="ISR_TRIMESTRAL">ISR Trimestral </option>}
                  {clienteSeleccionado.aplicaRetencionIsr && <option value="RETENCION_ISR">Retenciones ISR </option>}

                  {/* Fallback por si ningún flag está en true */}
                  {!clienteSeleccionado.aplicaIvaGeneral && !clienteSeleccionado.aplicaIsrt && !clienteSeleccionado.aplicaRetencionIsr && (
                    <>
                      <option value="IVA_GENERAL">IVA General</option>
                      <option value="ISR_TRIMESTRAL">ISR Trimestral </option>
                      <option value="RETENCION_ISR">Retenciones ISR </option>
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

          {/* Fila: Año y Mes */}
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

          {/* Estado del Semáforo */}
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

          {/* Número de Formulario */}
          <div className="form-group">
            <label>
              <Hash size={16} /> Número de Formulario 
            </label>
            <input 
              type="text" 
              placeholder="Ej: 20260811001" 
              value={numeroFormularioSat} 
              onChange={(e) => setNumeroFormularioSat(e.target.value)} 
              className="form-control" 
            />
          </div>

          {/* Campos Condicionales si está PRESENTADO */}
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

              <div className="form-group">
                <label>
                  <Link size={16} /> Enlace del Comprobante PDF
                </label>
                <input 
                  type="url" 
                  placeholder="https://declaraguate.sat.gob.gt/..." 
                  value={rutaComprobantePdf} 
                  onChange={(e) => setRutaComprobantePdf(e.target.value)} 
                  className="form-control" 
                />
              </div>
            </>
          )}

          {/* Observaciones */}
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

          {/* Botones de Acción */}
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