import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import DeclaracionPequenoContribuyenteForm from '../../components/forms/DeclaracionPequenoContribuyenteForm';
import './declaraciones.css'; 

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function DeclaracionPequenoContribuyente({ clientes = [], declaraciones = [], onReload }) {
  const [anioActual, setAnioActual] = useState(2026);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosSeleccionados, setDatosSeleccionados] = useState(null);

  // Filtrar solo clientes de Pequeño Contribuyente
  const clientesPC = clientes.filter((c) => {
    const regimen = (c.regimenFiscal || 'Pequeño contribuyente').toLowerCase();
    return regimen.includes('pequeño') || regimen.includes('pequeno');
  });

  const getEstadoCelda = (clienteId, mesIndex) => {
    const decla = declaraciones.find(
      (d) => (d.cliente?.idCliente === clienteId || d.clienteId === clienteId) && 
             d.anio === anioActual && 
             d.mes === mesIndex + 1 &&
             (d.tipoImpuesto === 'IVA_PEQUENO_CONTRIBUYENTE' || !d.tipoImpuesto)
    );

    if (decla) {
      if (decla.estadoSemaforo === 'VERDE' || decla.estadoSemaforo === 'PRESENTADO') return { label: '🟢', data: decla };
      if (decla.estadoSemaforo === 'AMARILLO' || decla.estadoSemaforo === 'EN_PROCESO') return { label: '🟡', data: decla };
    }

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
      declaracionExistente: celdaInfo.data
    });
    setModalAbierto(true);
  };

  const handleNuevoRegistro = () => {
    setDatosSeleccionados(null);
    setModalAbierto(true);
  };

  return (
    <div className="declaraciones-container">
      {/* Encabezado */}
      <div className="declaraciones-header">
        <div>
          <h1 className="declaraciones-title">
            Declaración de Cumplimiento - Pequeño Contribuyente
          </h1>
          <p className="declaraciones-subtitle">
            Control de obligaciones fiscales y presentación de declaraciones para clientes bajo el régimen de Pequeño Contribuyente
          </p>
        </div>

        <div className="declaraciones-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={handleNuevoRegistro} className="btn-registrar">
            <PlusCircle size={18} /> Registrar Declaración
          </button>

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

      {/* Leyenda y Matriz de Control */}
      <div className="legend-bar">
        <span>🟢 Presentado y Pagado</span>
        <span>🟡 En Proceso / Documentación Pendiente</span>
        <span>🔴 Omiso / Pendiente de Presentación</span>
        <span>⚪ Período Futuro / No Aplica</span>
      </div>

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
            {clientesPC.length === 0 ? (
              <tr>
                <td colSpan={15} className="no-data">
                  No hay clientes registrados en Pequeño Contribuyente.
                </td>
              </tr>
            ) : (
              clientesPC.map((cliente) => {
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
                    <td className="text-muted">{cliente.regimenFiscal || 'Pequeño contribuyente'}</td>
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
                          title={`Gestionar período ${MESES[index]} ${anioActual}`}
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

      {/* Modal de Formulario */}
      {modalAbierto && (
        <DeclaracionPequenoContribuyenteForm
          isOpen={modalAbierto}
          clientes={clientesPC}
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