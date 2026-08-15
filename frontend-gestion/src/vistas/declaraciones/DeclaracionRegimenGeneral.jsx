import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import DeclaracionRegimenGeneralForm from '../../components/forms/DeclaracionRegimenGeneralForm';
import './declaraciones.css'; 

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function DeclaracionRegimenGeneral({ clientes = [], declaraciones = [], onReload }) {
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());
  const [tipoFiltro, setTipoFiltro] = useState('IVA_GENERAL'); // 'IVA_GENERAL' | 'ISR_TRIMESTRAL' | 'RETENCION_ISR'
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosSeleccionados, setDatosSeleccionados] = useState(null);

  // Filtrar solo clientes del Régimen General
  const clientesGeneral = clientes.filter((c) => {
    const regimen = (c.regimenFiscal || '').toLowerCase();
    return regimen.includes('general') || regimen.includes('ordinario');
  });

  // Evalúa el semáforo considerando el tipo de impuesto actual seleccionado
  const getEstadoCelda = (clienteId, mesIndex) => {
    const mesBuscado = mesIndex + 1;

    const decla = declaraciones.find((d) => {
      const idClienteDecla = d.cliente?.idCliente || d.clienteId || d.cliente?.id;
      const idCoincide = Number(idClienteDecla) === Number(clienteId);

      const anioCoincide = Number(d.anio) === Number(anioActual);
      const mesCoincide = Number(d.mes) === Number(mesBuscado);

      return idCoincide && anioCoincide && mesCoincide;
    });

    // Si encontró el registro para ese cliente, año y mes
    if (decla) {
      // Leemos el estado independientemente del nombre exacto de la propiedad
      const estado = String(
        decla.estadoSemaforo || decla.estado || decla.estadoDeclaracion || ''
      ).toUpperCase().trim();

      // 🟢 VERDE
      if (
        estado === 'VERDE' || 
        estado === 'PRESENTADO' || 
        estado === 'PAGADO' || 
        estado === 'COMPLETADO' ||
        decla.fechaPresentacion
      ) {
        return { label: '🟢', data: decla };
      }

      // 🟡 AMARILLO
      if (
        estado === 'AMARILLO' || 
        estado.includes('PROCESO') || 
        estado.includes('PENDIENTE')
      ) {
        return { label: '🟡', data: decla };
      }

      // 🔴 ROJO
      if (estado === 'ROJO' || estado === 'OMISO') {
        return { label: '🔴', data: decla };
      }

      // Si existe algún registro guardado para este período, pintarlo en amarillo por defecto
      return { label: '🟡', data: decla };
    }

    // Si NO hay declaración guardada para el período:
    const mesHoy = new Date().getMonth();
    const anioHoy = new Date().getFullYear();

    if (anioActual < anioHoy || (anioActual === anioHoy && mesIndex < mesHoy)) {
      return { label: '🔴', data: null };
    }

    return { label: '⚪', data: null };
  };

  const handleCeldaClick = (cliente, mesIndex, celdaInfo) => {
    setDatosSeleccionados({
      cliente,
      anio: anioActual,
      mes: mesIndex + 1,
      declaracionExistente: celdaInfo.data ? { ...celdaInfo.data, tipoImpuesto: tipoFiltro } : { tipoImpuesto: tipoFiltro }
    });
    setModalAbierto(true);
  };

  const handleNuevoRegistro = () => {
    setDatosSeleccionados({
      anio: anioActual,
      declaracionExistente: { tipoImpuesto: tipoFiltro }
    });
    setModalAbierto(true);
  };

  return (
    <div className="declaraciones-container">
      {/* Encabezado Principal */}
      <div className="declaraciones-header">
        <div>
          <h1 className="declaraciones-title">
            Declaración de Cumplimiento - Régimen General
          </h1>
          <p className="declaraciones-subtitle">
            Control y seguimiento de las declaraciones para clientes bajo el Régimen General.
          </p>
        </div>

        <div className="declaraciones-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={handleNuevoRegistro} className="btn-registrar">
            <PlusCircle size={18} /> Registrar Declaración
          </button>

          {/* Selector de Año */}
          <div className="year-selector">
            <button onClick={() => setAnioActual(anioActual - 1)} className="btn-year">
              <ChevronLeft size={18} />
            </button>
            <span className="year-display">{anioActual}</span>
            <button onClick={() => setAnioActual(anioActual + 1)} className="btn-year">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Pestañas de Selección de Impuesto */}
      <div className="tax-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          className={`tab-item ${tipoFiltro === 'IVA_GENERAL' ? 'active' : ''}`}
          onClick={() => setTipoFiltro('IVA_GENERAL')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer', 
            backgroundColor: tipoFiltro === 'IVA_GENERAL' ? '#641f92' : '#E2E8F0',
            color: tipoFiltro === 'IVA_GENERAL' ? '#FFFFFF' : '#475569'
          }}
        >
          IVA General 
        </button>
        <button 
          className={`tab-item ${tipoFiltro === 'ISR_TRIMESTRAL' ? 'active' : ''}`}
          onClick={() => setTipoFiltro('ISR_TRIMESTRAL')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: tipoFiltro === 'ISR_TRIMESTRAL' ? '#641f92' : '#E2E8F0',
            color: tipoFiltro === 'ISR_TRIMESTRAL' ? '#FFFFFF' : '#475569'
          }}
        >
          ISR Trimestral 
        </button>
        <button 
          className={`tab-item ${tipoFiltro === 'RETENCION_ISR' ? 'active' : ''}`}
          onClick={() => setTipoFiltro('RETENCION_ISR')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: tipoFiltro === 'RETENCION_ISR' ? '#641f92' : '#E2E8F0',
            color: tipoFiltro === 'RETENCION_ISR' ? '#FFFFFF' : '#475569'
          }}
        >
          Retenciones ISR 
        </button>
      </div>

      <div className="legend-bar">
        <span>🟢 Presentado y Pagado</span>
        <span>🟡 En Proceso / Documentación Pendiente</span>
        <span>🔴 Omiso / Pendiente de Presentación</span>
        <span>⚪ Período Futuro / No Aplica</span>
      </div>

      {/* Tabla Matriz */}
      <div className="table-card">
        <table className="declaraciones-table">
          <thead>
            <tr>
              <th>CLIENTE / RAZÓN SOCIAL</th>
              <th>RÉGIMEN FISCAL</th>
              <th>ESTADO</th>
              {MESES.map((m) => (
                <th key={m} className="text-center">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clientesGeneral.length === 0 ? (
              <tr>
                <td colSpan={15} className="no-data">
                  No hay clientes registrados en el Régimen General.
                </td>
              </tr>
            ) : (
              clientesGeneral.map((cliente) => {
                const idCliente = cliente.idCliente || cliente.id;
                const nombreCliente = 
                  cliente.nombre || 
                  cliente.razonSocial || 
                  cliente.nombreRazonSocial || 
                  `Cliente ${idCliente}`;
                
                return (
                  <tr key={idCliente}>
                    <td className="font-semibold">
                      {nombreCliente}
                      {cliente.nit && <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>NIT: {cliente.nit}</span>}
                    </td>
                    <td className="text-muted">{cliente.regimenFiscal || 'Régimen General'}</td>
                    <td>
                      <span className={`badge ${cliente.habilitado === false ? 'badge-rojo' : 'badge-verde'}`}>
                        {cliente.habilitado === false ? 'Inactivo' : 'Activo'}
                      </span>
                    </td>
                    {MESES.map((_, index) => {
                      const celda = getEstadoCelda(idCliente, index);
                      return (
                        <td 
                          key={index} 
                          onClick={() => handleCeldaClick(cliente, index, celda)}
                          className="cell-status"
                          title={`Gestionar período ${MESES[index]} ${anioActual} (${tipoFiltro})`}
                        >
                          {celda.label}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Formulario Específico de Régimen General */}
      {modalAbierto && (
        <DeclaracionRegimenGeneralForm
          isOpen={modalAbierto}
          clientes={clientesGeneral}
          datosIniciales={datosSeleccionados}
          onClose={() => setModalAbierto(false)}
          onSave={() => {
            setModalAbierto(false);
            if (onReload) onReload();
          }}
        />
      )}
    </div>
  );
}