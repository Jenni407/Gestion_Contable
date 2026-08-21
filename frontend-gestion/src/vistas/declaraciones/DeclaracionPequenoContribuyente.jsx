import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import DeclaracionPequenoContribuyenteForm from '../../components/forms/DeclaracionPequenoContribuyenteForm';
import Paginador from '../../components/common/Paginador';
import './declaraciones.css'; 

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function DeclaracionPequenoContribuyente({ clientes = [], declaraciones = [], onReload }) {
  const [anioActual, setAnioActual] = useState(2026);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosSeleccionados, setDatosSeleccionados] = useState(null);
  const [pagina, setPagina] = useState(1);

  const POR_PAGINA = 15;

  // Filtrar solo clientes de Pequeño Contribuyente
  const clientesPC = clientes.filter((c) => {
    const regimen = (c.regimenFiscal || 'Pequeño contribuyente').toLowerCase();
    return regimen.includes('pequeño') || regimen.includes('pequeno');
  });

  const totalPaginas = Math.ceil(clientesPC.length / POR_PAGINA);
  const paginaSegura = Math.min(pagina, Math.max(totalPaginas, 1));
  const clientesPCPagina = clientesPC.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA);

  // Evalúa el semáforo para la matriz de Pequeño Contribuyente
  const getEstadoCelda = (clienteId, mesIndex) => {
    const mesBuscado = mesIndex + 1;

    // Buscar TODOS los registros del cliente, año, mes y que sean de Pequeño Contribuyente
    const declaracionesDelMes = declaraciones.filter((d) => {
      // 1. Coincidencia de Cliente (flexible para String vs Number)
      const idCoincide = Number(d.cliente?.idCliente || d.clienteId || d.cliente?.id) === Number(clienteId);

      // 2. Coincidencia de Año y Mes
      const anioCoincide = Number(d.anio) === Number(anioActual);
      const mesCoincide = Number(d.mes) === Number(mesBuscado);

      // 3. Coincidencia del Tipo de Impuesto (Acepta variaciones o si viene nulo)
      const tipoGuardado = d.tipoImpuesto ? String(d.tipoImpuesto).toUpperCase() : '';
      const tipoCoincide =
        !d.tipoImpuesto ||
        tipoGuardado.includes('PEQUENO') ||
        tipoGuardado.includes('PEQUEÑO') ||
        tipoGuardado.includes('PC') ||
        tipoGuardado === 'IVA_PEQUENO_CONTRIBUYENTE';

      return idCoincide && anioCoincide && mesCoincide && tipoCoincide;
    });

    // Si existen registros guardados, se prioriza el estado más relevante
    if (declaracionesDelMes.length > 0) {
      // 🟢 Verde: Presentado y Pagado (o con fecha de presentación registrada)
      const presentado = declaracionesDelMes.find((d) => {
        const estado = d.estadoSemaforo ? String(d.estadoSemaforo).toUpperCase().trim() : '';
        return (
          estado === 'VERDE' ||
          estado === 'PRESENTADO' ||
          estado === 'PAGADO' ||
          (d.fechaPresentacion && String(d.fechaPresentacion).trim() !== '')
        );
      });
      if (presentado) return { label: '🟢', data: presentado };

      // 🟡 Amarillo: En Proceso / Documentación Pendiente
      const enProceso = declaracionesDelMes.find((d) => {
        const estado = d.estadoSemaforo ? String(d.estadoSemaforo).toUpperCase().trim() : '';
        return (
          estado === 'AMARILLO' ||
          estado === 'EN_PROCESO' ||
          estado === 'PROCESO' ||
          estado === 'EN PROCESO' ||
          estado === 'PENDIENTE_DOCUMENTACION'
        );
      });
      if (enProceso) return { label: '🟡', data: enProceso };

      // 🔴 Rojo: Omiso / Pendiente
      return { label: '🔴', data: declaracionesDelMes[0] };
    }

    // Si NO existe registro guardado en la BD para este mes/año:
    const fechaActual = new Date();
    const mesHoy = fechaActual.getMonth(); // 0-11
    const anioHoy = fechaActual.getFullYear();

    // Meses anteriores sin registro -> 🔴 Omiso / Pendiente
    if (anioActual < anioHoy || (anioActual === anioHoy && mesIndex < mesHoy)) {
      return { label: '🔴', data: null };
    }

    // Períodos futuros -> ⚪ Período Futuro / No Aplica
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
        <span>🔴 Omiso / Vencido / Pendiente de Presentación</span>
        <span>⚪ Sin registrar / Período vigente</span>
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
              clientesPCPagina.map((cliente) => {
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
        <Paginador total={clientesPC.length} porPagina={POR_PAGINA} pagina={paginaSegura} onCambiarPagina={setPagina} />
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