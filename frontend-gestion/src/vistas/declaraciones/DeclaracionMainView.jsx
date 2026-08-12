import React, { useState, useEffect } from 'react';
import DeclaracionPequenoContribuyente from './DeclaracionPequenoContribuyente';
import DeclaracionRegimenGeneral from './DeclaracionRegimenGeneral'; 
import { ClientesAPI, DeclaracionesAPI } from '../../api/axiosConfig'; 
import './declaraciones.css';

export default function DeclaracionesMainView({ onReload }) {
  // Pestaña activa principal
  const [tabRegimen, setTabRegimen] = useState('PC');

  const [clientes, setClientes] = useState([]);
  const [declaraciones, setDeclaraciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga inicial de datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resClientes, resDeclaraciones] = await Promise.allSettled([
        ClientesAPI.obtenerTodos(),
        DeclaracionesAPI.obtenerTodas()
      ]);

      setClientes(
        resClientes.status === 'fulfilled' 
          ? (Array.isArray(resClientes.value.data) ? resClientes.value.data : (resClientes.value.data?.content || []))
          : []
      );
      setDeclaraciones(
        resDeclaraciones.status === 'fulfilled' 
          ? (Array.isArray(resDeclaraciones.value.data) ? resDeclaraciones.value.data : (resDeclaraciones.value.data?.content || []))
          : []
      );
    } catch (error) {
      console.error('Error al cargar información de declaraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const recargarDespuesDeGuardar = async () => {
    await cargarDatos();
    if (onReload) onReload();
  };

  return (
    <div className="declaraciones-main-container" style={{ padding: '20px' }}>
      
      {/* Pestañas para cambiar entre Pequeño Contribuyente (PC) y Régimen General (CG) */}
      <div 
        className="tabs-regimen-container" 
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '8px'
        }}
      >
        <button
          onClick={() => setTabRegimen('PC')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            backgroundColor: tabRegimen === 'PC' ? '#6B21A8' : '#f1f5f9',
            color: tabRegimen === 'PC' ? '#ffffff' : '#64748b',
            transition: 'all 0.2s ease'
          }}
        >
          Pequeño Contribuyente (PC)
        </button>

        <button
          onClick={() => setTabRegimen('CG')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            backgroundColor: tabRegimen === 'CG' ? '#6B21A8' : '#f1f5f9',
            color: tabRegimen === 'CG' ? '#ffffff' : '#64748b',
            transition: 'all 0.2s ease'
          }}
        >
          Régimen General (CG)
        </button>
      </div>

      {/* Indicador de Carga */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Cargando matriz de declaraciones...
        </div>
      ) : (
        /* Renderizado Condicional del Régimen Seleccionado */
        <div>
          {tabRegimen === 'PC' && (
            <DeclaracionPequenoContribuyente 
              clientes={clientes} 
              declaraciones={declaraciones} 
              onReload={recargarDespuesDeGuardar} 
            />
          )}

          {tabRegimen === 'CG' && (
            <DeclaracionRegimenGeneral 
              clientes={clientes} 
              declaraciones={declaraciones} 
              onReload={recargarDespuesDeGuardar} 
            />
          )}
        </div>
      )}
    </div>
  );
}