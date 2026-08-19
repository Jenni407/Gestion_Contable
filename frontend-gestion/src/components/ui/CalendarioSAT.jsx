import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const esFinDeSemana = (fecha) => {
  const dia = fecha.getDay();
  return dia === 0 || dia === 6;
};

const obtenerUltimoDiaHabil = (year, month) => {
  const ultimoDia = new Date(year, month + 1, 0);
  while (esFinDeSemana(ultimoDia)) {
    ultimoDia.setDate(ultimoDia.getDate() - 1);
  }
  return ultimoDia.getDate();
};

const obtenerDiaHabilN = (year, month, n) => {
  let contador = 0;
  let fecha = new Date(year, month, 1);
  while (fecha.getMonth() === month) {
    if (!esFinDeSemana(fecha)) {
      contador++;
      if (contador === n) return fecha.getDate();
    }
    fecha.setDate(fecha.getDate() + 1);
  }
  return 10;
};

export default function CalendarioSAT() {
  const [fechaActual, setFechaActual] = useState(new Date());

  const year = fechaActual.getFullYear();
  const month = fechaActual.getMonth();
  const nombreMes = fechaActual.toLocaleString('es-GT', { month: 'long', year: 'numeric' });

  const ultimoDiaHabil = obtenerUltimoDiaHabil(year, month);
  const diaHabil10 = obtenerDiaHabilN(year, month, 10);

  const primerDiaMes = new Date(year, month, 1).getDay();
  const totalDiasMes = new Date(year, month + 1, 0).getDate();

  const cambiarMes = (offset) => {
    setFechaActual(new Date(year, month + offset, 1));
  };

  const hoy = new Date();
  const esHoy = (dia) => 
    hoy.getDate() === dia && hoy.getMonth() === month && hoy.getFullYear() === year;

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={20} color="#2563eb" />
          <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0, textTransform: 'capitalize' }}>
            Calendario Tributario - {nombreMes}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => cambiarMes(-1)} style={btnNavStyle} title="Mes anterior">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => cambiarMes(1)} style={btnNavStyle} title="Mes siguiente">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ ...dotStyle, backgroundColor: '#16a34a' }}></span>
          <span><strong>Día {ultimoDiaHabil}:</strong> Vencimiento IVA PC / RG</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ ...dotStyle, backgroundColor: '#d97706' }}></span>
          <span><strong>Día {diaHabil10}:</strong> Vencimiento Retenciones ISR</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
          <div key={dia} style={{ fontWeight: '700', fontSize: '0.78rem', color: '#64748b', padding: '6px 0' }}>
            {dia}
          </div>
        ))}

        {Array.from({ length: primerDiaMes }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: totalDiasMes }).map((_, index) => {
          const dia = index + 1;
          const esVencimientoIVA = dia === ultimoDiaHabil;
          const esVencimientoISR = dia === diaHabil10;

          let background = '#f8fafc';
          let border = '1px solid #e2e8f0';
          let color = '#1e293b';
          let badgeText = null;

          if (esVencimientoIVA) {
            background = '#dcfce7';
            border = '1px solid #16a34a';
            color = '#14532d';
            badgeText = 'IVA PC / RG';
          } else if (esVencimientoISR) {
            background = '#fef3c7';
            border = '1px solid #d97706';
            color = '#78350f';
            badgeText = 'Ret. ISR';
          }

          if (esHoy(dia)) {
            border = '2px solid #2563eb';
          }

          return (
            <div
              key={dia}
              style={{
                backgroundColor: background,
                border: border,
                borderRadius: '8px',
                padding: '8px 4px',
                minHeight: '54px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
                fontWeight: esVencimientoIVA || esVencimientoISR || esHoy(dia) ? '700' : '500',
                color: color
              }}
            >
              <span>{dia}</span>
              {badgeText && (
                <span style={{
                  fontSize: '0.62rem',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  backgroundColor: esVencimientoIVA ? '#16a34a' : '#d97706',
                  color: '#fff',
                  fontWeight: '600',
                  lineHeight: '1'
                }}>
                  {badgeText}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const btnNavStyle = {
  backgroundColor: '#f1f5f9',
  border: 'none',
  padding: '6px 10px',
  borderRadius: '6px',
  cursor: 'pointer',
  color: '#475569',
  display: 'flex',
  alignItems: 'center'
};

const dotStyle = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  display: 'inline-block'
};

