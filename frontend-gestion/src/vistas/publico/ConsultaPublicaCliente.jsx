import React, { useState, useEffect } from 'react';
import { 
  SearchIcon, 
  FileTextIcon, 
  CloseIcon,
  ShieldCheckIcon,
  CalendarIcon,
  LockIcon,
  PhoneCallIcon,
  ArrowLeftIcon,
  RotateCcwIcon,
  CheckCircleIcon,
  ExternalLinkIcon 
} from "../../components/icons/Icons";

import { DeclaracionesAPI } from "../../api/axiosConfig"; 
import Paginador from "../../components/common/Paginador"; 

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function ConsultaPublicaCliente() {
  const [nit, setNit] = useState('');
  const [telefonoConfirmacion, setTelefonoConfirmacion] = useState('');
  const [declaraciones, setDeclaraciones] = useState([]);
  const [nombreCliente, setNombreCliente] = useState('');
  const [cargando, setCargando] = useState(false);
  const [buscado, setBuscado] = useState(false);
  
  // Estado para el modal de seguridad
  const [mostrarModalSeguridad, setMostrarModalSeguridad] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState('');

  // Estado para el filtro interno por No. Formulario SAT
  const [filtroFormulario, setFiltroFormulario] = useState('');

  // Paginación (15 formularios por página)
  const [paginaPublica, setPaginaPublica] = useState(1);
  const POR_PAGINA = 15;

  // Reinicia a la primera página cuando cambia el filtro o llegan nuevos resultados
  useEffect(() => {
    setPaginaPublica(1);
  }, [filtroFormulario, declaraciones]);

  // Regresar a Inicio / Login
  const handleRegresar = () => {
    window.location.href = '/login';
  };

  // Reiniciar formulario para una nueva búsqueda
  const handleNuevaBusqueda = () => {
    setNit('');
    setTelefonoConfirmacion('');
    setDeclaraciones([]);
    setNombreCliente('');
    setBuscado(false);
    setFiltroFormulario('');
    setErrorValidacion('');
  };

  // Abrir Modal de Confirmación
  const handleAbrirModal = (e) => {
    e.preventDefault();
    if (!nit.trim()) return;
    setErrorValidacion('');
    setTelefonoConfirmacion('');
    setMostrarModalSeguridad(true);
  };

  // Validar y Ejecutar Búsqueda Real
  const handleConfirmarYBuscar = async (e) => {
    e.preventDefault();
    
    if (!telefonoConfirmacion.trim()) {
      setErrorValidacion('Por favor ingresa los datos de verificación.');
      return;
    }

    setCargando(true);
    setErrorValidacion('');

    try {
      const nitLimpio = nit.trim().replace(/\s+/g, '');
      const telLimpio = telefonoConfirmacion.trim().replace(/\s+/g, '');
      
      const response = await DeclaracionesAPI.obtenerPublicoPorNit(
        encodeURIComponent(nitLimpio), 
        encodeURIComponent(telLimpio)
      );
      
      const data = response.data || [];
      const lista = Array.isArray(data) ? data : data.declaraciones || [];

      const declaradas = lista.filter(d => {
        const est = (d.estadoSemaforo || d.estado || '').toUpperCase();
        return est === 'PRESENTADO' || est === 'PAGADO' || est === 'VERDE';
      });

      setDeclaraciones(declaradas);

      if (lista.length > 0 && (lista[0].cliente || lista[0].nombreCliente)) {
        setNombreCliente(
          lista[0].cliente?.nombreRazonSocial || 
          lista[0].cliente?.nombre || 
          lista[0].nombreCliente || 
          ''
        );
      } else {
        setNombreCliente('');
      }

      setBuscado(true);
      setMostrarModalSeguridad(false);

    } catch (error) {
      console.error('Error al consultar declaraciones:', error);
      setErrorValidacion(
        error.response?.data?.mensaje || 'El número telefónico no coincide con los registros de este NIT.'
      );
    } finally {
      setCargando(false);
    }
  };

  const obtenerBadgeRegimen = (regimenRaw) => {
    const reg = (regimenRaw || '').toUpperCase();
    const esPequeno = reg.includes('PEQUEÑO') || reg.includes('PEQUENO') || reg.includes('SMALL') || reg.includes('PC') || reg.includes('IVA_PEQUENO');

    return {
      texto: esPequeno ? 'Pequeño Contribuyente' : 'Régimen General',
      style: {
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '700',
        backgroundColor: esPequeno ? '#f3e8ff' : '#e0e7ff',
        color: esPequeno ? '#6b21a8' : '#3730a3',
        border: esPequeno ? '1px solid #d8b4fe' : '1px solid #c7d2fe',
        display: 'inline-block'
      }
    };
  };

  const declaracionesFiltradas = declaraciones.filter((d) => {
    const numFormulario = d.numeroFormularioSat || d.noFormulario || d.numeroFormulario || '';
    return numFormulario.toLowerCase().includes(filtroFormulario.toLowerCase());
  });

  const totalPaginasPublicas = Math.ceil(declaracionesFiltradas.length / POR_PAGINA);
  const paginaSeguraPublica = Math.min(paginaPublica, Math.max(totalPaginasPublicas, 1));
  const declaracionesPagina = declaracionesFiltradas.slice((paginaSeguraPublica - 1) * POR_PAGINA, paginaSeguraPublica * POR_PAGINA);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '32px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* Barra Superior con Acciones */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={handleRegresar}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#6b21a8',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(107, 33, 168, 0.2)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#581c87'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b21a8'}
          >
            <ArrowLeftIcon size={18} /> Volver al Inicio de Sesión
          </button>

          {buscado && (
            <button
              onClick={handleNuevaBusqueda}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'transparent',
                color: '#6b21a8',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <RotateCcwIcon size={16} /> Nueva consulta
            </button>
          )}
        </div>

        {/* Encabezado Principal */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '12px' }}>
            <ShieldCheckIcon size={18} /> Portal de Consulta Contable
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e1b4b', margin: '0 0 8px 0' }}>
            Consulta de Declaraciones Presentadas
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Ingresa tu NIT para descargar tus recibos y comprobantes de Pequeño Contribuyente o Régimen General.
          </p>
        </div>

        {/* Tarjeta de Búsqueda */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px', border: '1px solid #f1f5f9' }}>
          <form onSubmit={handleAbrirModal} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Ingresa tu NIT sin guiones"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                <SearchIcon size={18} color="#94a3b8" />
              </div>
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: '#6b21a8',
                color: '#ffffff',
                padding: '12px 28px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(107, 33, 168, 0.2)'
              }}
            >
              Consultar NIT
            </button>
          </form>
        </div>

        {/* Banner de Contribuyente Encontrado */}
        {buscado && nombreCliente && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', color: '#166534', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircleIcon size={18} color="#16a34a" />
            Contribuyente: {nombreCliente} (NIT: {nit})
          </div>
        )}

        {/* Tabla de Resultados */}
        {buscado && !cargando && (
          <div>
            {declaraciones.length > 0 ? (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                
                {/* Cabecera Interna de Búsqueda */}
                <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1e1b4b' }}>
                    Histórico ({declaracionesFiltradas.length} formulario(s))
                  </span>
                  <div style={{ position: 'relative', width: '260px' }}>
                    <input
                      type="text"
                      placeholder="Filtrar por No. Formulario SAT..."
                      value={filtroFormulario}
                      onChange={(e) => setFiltroFormulario(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 34px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                      <SearchIcon size={15} color="#94a3b8" />
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '14px 16px' }}>PERÍODO</th>
                        <th style={{ padding: '14px 16px' }}>RÉGIMEN</th>
                        <th style={{ padding: '14px 16px' }}>NO. FORMULARIO SAT</th>
                        <th style={{ padding: '14px 16px', textAlign: 'center' }}>ESTADO</th>
                        <th style={{ padding: '14px 16px', textAlign: 'center' }}>COMPROBANTE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {declaracionesPagina.map((d, index) => {
                        const mesTexto = d.mes ? NOMBRES_MESES[d.mes - 1] : d.periodo || 'N/A';
                        const badgeRegimen = obtenerBadgeRegimen(d.cliente?.regimenFiscal || d.tipoImpuesto);
                        const numFormulario = d.numeroFormularioSat || d.noFormulario || d.numeroFormulario || 'Sin número';
                        const pdfUrl = d.rutaComprobantePdf || d.archivoUrl || d.pdfPath;
                        const idDec = d.idDeclaracion || d.id;

                        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
                        const downloadLink = pdfUrl && pdfUrl.startsWith('http')
                          ? pdfUrl
                          : (pdfUrl
                              ? `${apiBase}/declaraciones/publico/descargar/${idDec}`
                              : null);

                        return (
                          <tr key={idDec || `dec-${index}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 16px', fontWeight: '700', color: '#1e1b4b' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <CalendarIcon size={15} color="#6b21a8" />
                                {mesTexto} {d.anio || ''}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={badgeRegimen.style}>{badgeRegimen.texto}</span>
                            </td>
                            <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: '600', color: '#334155' }}>
                              {numFormulario}
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                backgroundColor: '#dcfce7',
                                color: '#15803d'
                              }}>
                                PRESENTADO
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                              {downloadLink ? (
                                <a
                                  href={downloadLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: '#2563eb',
                                    fontWeight: '600',
                                    textDecoration: 'none'
                                  }}
                                >
                                  <FileTextIcon size={16} color="#2563eb" /> Ver PDF <ExternalLinkIcon size={12} color="#2563eb" />
                                </a>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Sin PDF</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPaginasPublicas > 1 && (
                  <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0' }}>
                    <Paginador
                      paginaActual={paginaSeguraPublica}
                      totalPaginas={totalPaginasPublicas}
                      onCambiarPagina={(pag) => setPaginaPublica(pag)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b', margin: 0 }}>No se encontraron declaraciones presentadas para este NIT.</p>
              </div>
            )}
          </div>
        )}

        {/* MODAL DE SEGURIDAD */}
        {mostrarModalSeguridad && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LockIcon size={20} color="#6b21a8" />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e1b4b' }}>Verificación de Seguridad</h3>
                </div>
                <button
                  onClick={() => setMostrarModalSeguridad(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <CloseIcon size={18} color="#94a3b8" />
                </button>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>
                Para proteger la privacidad de los datos, ingresa el número telefónico registrado para el NIT: <strong>{nit}</strong>
              </p>

              {errorValidacion && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '0.825rem',
                  marginBottom: '16px'
                }}>
                  {errorValidacion}
                </div>
              )}

              <form onSubmit={handleConfirmarYBuscar}>
                <div style={{ marginBottom: '20px', position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Número de teléfono registrado"
                    value={telefonoConfirmacion}
                    onChange={(e) => setTelefonoConfirmacion(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <PhoneCallIcon size={16} color="#94a3b8" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setMostrarModalSeguridad(false)}
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={cargando}
                    style={{
                      backgroundColor: '#6b21a8',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: cargando ? 'not-allowed' : 'pointer',
                      opacity: cargando ? 0.7 : 1
                    }}
                  >
                    {cargando ? 'Verificando...' : 'Verificar y Consultar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}