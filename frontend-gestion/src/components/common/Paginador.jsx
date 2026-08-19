import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Paginador({ total, porPagina = 15, pagina, onCambiarPagina }) {
  if (total <= porPagina) return null;

  const totalPaginas = Math.ceil(total / porPagina);
  const desde = (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, total);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', flexWrap: 'wrap', gap: '8px' }}>
      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
        Mostrando {desde} - {hasta} de {total}
      </span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => onCambiarPagina(pagina - 1)}
          disabled={pagina <= 1}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: pagina <= 1 ? '#94a3b8' : '#334155', cursor: pagina <= 1 ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
        >
          <ChevronLeft size={14} /> Anterior
        </button>
        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>
          Página {pagina} de {totalPaginas}
        </span>
        <button
          type="button"
          onClick={() => onCambiarPagina(pagina + 1)}
          disabled={pagina >= totalPaginas}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: pagina >= totalPaginas ? '#94a3b8' : '#334155', cursor: pagina >= totalPaginas ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
        >
          Siguiente <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
