import React, { useState } from 'react';
import { SearchIcon, FileTextIcon } from '../../components/icons/Icons';
import { ExternalLink } from 'lucide-react';

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function DeclaracionPequenoContribuyenteList({ declaraciones = [] }) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  // Filtrar estrictamente las declaraciones de Pequeño Contribuyente
  const declaracionesFiltradas = declaraciones.filter((d) => {
    const esPC = d.tipoImpuesto === 'IVA_PEQUENO_CONTRIBUYENTE' || !d.tipoImpuesto;
    
    if (!esPC) return false;

    const nombreCliente = 
      d.cliente?.nombreRazonSocial || 
      d.cliente?.nombre || 
      d.cliente?.razonSocial || 
      '';

    const numFormulario = d.numeroFormularioSat || '';
    
    const coincideTexto = nombreCliente.toLowerCase().includes(busqueda.toLowerCase()) || 
                          numFormulario.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado = filtroEstado === 'TODOS' || d.estadoSemaforo === filtroEstado;

    return coincideTexto && coincideEstado;
  });

  const renderEstadoBadge = (estado) => {
    switch (estado) {
      case 'PRESENTADO':
      case 'VERDE':
        return (
          <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', background: '#dcfce7', color: '#166534' }}>
            🟢 Presentado
          </span>
        );
      case 'EN_PROCESO':
      case 'AMARILLO':
        return (
          <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', background: '#fef9c3', color: '#854d0e' }}>
            🟡 En Proceso
          </span>
        );
      case 'PENDIENTE':
      case 'ROJO':
        return (
          <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', background: '#fee2e2', color: '#991b1b' }}>
            🔴 Pendiente
          </span>
        );
      default:
        return (
          <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', background: '#f1f5f9', color: '#475569' }}>
            {estado || 'Sin Estado'}
          </span>
        );
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
          Reporte de Declaraciones - Pequeño Contribuyente
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Control y seguimiento de las declaraciones para clientes bajo el régimen de Pequeño Contribuyente.
        </p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', flex: 1, minWidth: '250px' }}>
          <SearchIcon style={{ marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Buscar por cliente o No. Formulario" 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
          />
        </div>

        <select 
          value={filtroEstado} 
          onChange={(e) => setFiltroEstado(e.target.value)} 
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.875rem', fontWeight: '500' }}
        >
          <option value="TODOS">Todos los Estados</option>
          <option value="PRESENTADO">🟢 Presentado y Pagado</option>
          <option value="EN_PROCESO">🟡 En Proceso</option>
          <option value="PENDIENTE">🔴 Pendiente / Omiso</option>
        </select>
      </div>

      {/* Tabla de Reporte */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '14px 16px' }}>CLIENTE</th>
              <th style={{ padding: '14px 16px' }}>PERÍODO</th>
              <th style={{ padding: '14px 16px' }}>FORMULARIO </th>
              <th style={{ padding: '14px 16px' }}>FECHA PRESENTACIÓN</th>
              <th style={{ padding: '14px 16px' }}>ESTADO</th>
              <th style={{ padding: '14px 16px' }}>COMPROBANTE</th>
              <th style={{ padding: '14px 16px' }}>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {declaracionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  No se encontraron declaraciones de Pequeño Contribuyente.
                </td>
              </tr>
            ) : (
              declaracionesFiltradas.map((d, index) => (
                <tr key={d.idDeclaracion || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: '#1e293b' }}>
                    {d.cliente?.nombreRazonSocial || d.cliente?.nombre || d.cliente?.razonSocial || 'Cliente Desconocido'}
                    {d.cliente?.nit && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>
                        NIT: {d.cliente.nit}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569', fontWeight: '500' }}>
                    {NOMBRES_MESES[(d.mes || 1) - 1]} {d.anio}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 'bold', color: '#6b21a8' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <FileTextIcon />
                      {d.numeroFormularioSat || 'SAT-2046'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>
                    {d.fechaPresentacion || 'Sin registro'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {renderEstadoBadge(d.estadoSemaforo)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {d.rutaComprobantePdf ? (
                      <a 
                        href={d.rutaComprobantePdf} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}
                      >
                        Ver PDF <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Sin adjunto</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>
                    {d.observacionesBitacora || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}