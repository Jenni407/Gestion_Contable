import { useState, useEffect } from 'react';
import { SearchIcon, FileTextIcon } from '../../components/icons/Icons';
import { ExternalLink } from 'lucide-react';
import Paginador from '../../components/common/Paginador';
import api from '../../api/axiosConfig';

// Construye la URL correcta para ver el comprobante PDF en una pestaña nueva
const obtenerUrlComprobante = (d) => {
  const ruta = d.rutaComprobantePdf;
  if (!ruta) return null;
  if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
  const id = d.idDeclaracion || d.id;
  if (!id) return null;
  const base = api.defaults.baseURL || 'http://localhost:8080/api';
  return `${base}/declaraciones/publico/comprobante/${id}`;
};

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const TIPOS_IMPUESTO_LABELS = {
  'IVA_GENERAL': { label: 'IVA General (SAT-2237)', badgeColor: '#dbeafe', textColor: '#1e40af' },
  'ISR_TRIMESTRAL': { label: 'ISR Trimestral (SAT-1361)', badgeColor: '#e0e7ff', textColor: '#3730a3' },
  'RETENCION_ISR': { label: 'Retención ISR (SAT-1331)', badgeColor: '#fae8ff', textColor: '#86198f' }
};

export default function DeclaracionRegimenGeneralList({ declaraciones = [] }) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroImpuesto, setFiltroImpuesto] = useState('TODOS');
  const [pagina, setPagina] = useState(1);

  const POR_PAGINA = 15;

  // Filtrar declaraciones correspondientes al Régimen General
const declaracionesFiltradas = declaraciones.filter((d) => {
  const tipo = d.tipoImpuesto ? String(d.tipoImpuesto).toUpperCase() : '';

  // Excluimos explícitamente Pequeño Contribuyente o tipos no asignados
  const esPequeño = tipo.includes('PEQUENO') || tipo.includes('PC') || tipo === 'IVA_PEQUENO_CONTRIBUYENTE';

  // Validamos que sea un tipo perteneciente al Régimen General
  const esGeneral = !esPequeño && (
    tipo === 'IVA_GENERAL' || 
    tipo === 'ISR_TRIMESTRAL' || 
    tipo === 'RETENCION_ISR' ||
    tipo.includes('GENERAL')
  );

  if (!esGeneral) return false;

    const nombreCliente = 
      d.cliente?.nombreRazonSocial || 
      d.cliente?.nombre || 
      d.cliente?.razonSocial || 
      '';

    const numFormulario = d.numeroFormularioSat || '';
const coincideTexto = nombreCliente.toLowerCase().includes(busqueda.toLowerCase()) || 
                        numFormulario.toLowerCase().includes(busqueda.toLowerCase());

  const estadoGuardado = d.estadoSemaforo ? String(d.estadoSemaforo).toUpperCase() : '';
  const coincideEstado = filtroEstado === 'TODOS' || 
                         estadoGuardado === filtroEstado ||
                         (filtroEstado === 'PRESENTADO' && estadoGuardado === 'VERDE') ||
                         (filtroEstado === 'EN_PROCESO' && estadoGuardado === 'AMARILLO') ||
                         (filtroEstado === 'PENDIENTE' && estadoGuardado === 'ROJO');

  const coincideImpuesto = filtroImpuesto === 'TODOS' || tipo === filtroImpuesto;

  return coincideTexto && coincideEstado && coincideImpuesto;
  });

  // Reinicia a la primera página cuando cambian los filtros
  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroEstado, filtroImpuesto]);

  const totalPaginas = Math.ceil(declaracionesFiltradas.length / POR_PAGINA);
  const paginaSegura = Math.min(pagina, Math.max(totalPaginas, 1));
  const declaracionesPagina = declaracionesFiltradas.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA);

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

  const renderImpuestoBadge = (tipo) => {
    const info = TIPOS_IMPUESTO_LABELS[tipo] || { label: tipo, badgeColor: '#f1f5f9', textColor: '#475569' };
    return (
      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', background: info.badgeColor, color: info.textColor }}>
        {info.label}
      </span>
    );
  };

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>
          Reporte de Declaraciones - Régimen General
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Visualiza y gestiona las declaraciones de clientes bajo el Régimen General.
        </p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', flex: 1, minWidth: '250px' }}>
          <SearchIcon style={{ marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Buscar cliente o No. Formulario" 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
          />
        </div>

        {/* Filtro por tipo de Impuesto */}
        <select 
          value={filtroImpuesto} 
          onChange={(e) => setFiltroImpuesto(e.target.value)} 
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.875rem', fontWeight: '500' }}
        >
          <option value="TODOS">Todos los Impuestos</option>
          <option value="IVA_GENERAL">IVA General </option>
          <option value="ISR_TRIMESTRAL">ISR Trimestral </option>
          <option value="RETENCION_ISR">Retenciones ISR </option>
        </select>

        {/* Filtro por Estado */}
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
              <th style={{ padding: '14px 16px' }}>IMPUESTO</th>
              <th style={{ padding: '14px 16px' }}>PERÍODO</th>
              <th style={{ padding: '14px 16px' }}>NO. FORMULARIO</th>
              <th style={{ padding: '14px 16px' }}>FECHA PRESENTACIÓN</th>
              <th style={{ padding: '14px 16px' }}>ESTADO</th>
              <th style={{ padding: '14px 16px' }}>COMPROBANTE</th>
              <th style={{ padding: '14px 16px' }}>OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {declaracionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  No se encontraron declaraciones del Régimen General.
                </td>
              </tr>
            ) : (
              declaracionesPagina.map((d, index) => (
                <tr key={d.idDeclaracion || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: '#1e293b' }}>
                    {d.cliente?.nombreRazonSocial || d.cliente?.nombre || d.cliente?.razonSocial || 'Cliente Desconocido'}
                    {d.cliente?.nit && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>
                        NIT: {d.cliente.nit}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {renderImpuestoBadge(d.tipoImpuesto)}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569', fontWeight: '500' }}>
                    {NOMBRES_MESES[(d.mes || 1) - 1]} {d.anio}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 'bold', color: '#1d4ed8' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <FileTextIcon />
                      {d.numeroFormularioSat || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>
                    {d.fechaPresentacion || 'Sin registro'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {renderEstadoBadge(d.estadoSemaforo)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {obtenerUrlComprobante(d) ? (
                      <a 
                        href={obtenerUrlComprobante(d)} 
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
        <Paginador total={declaracionesFiltradas.length} porPagina={POR_PAGINA} pagina={paginaSegura} onCambiarPagina={setPagina} />
      </div>
    </div>
  );
}