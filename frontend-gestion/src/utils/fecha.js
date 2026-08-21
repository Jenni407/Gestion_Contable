// Utilidades de fecha basadas en la hora LOCAL del navegador (nunca UTC)

// Devuelve la fecha de hoy en formato YYYY-MM-DD usando la zona horaria del navegador
export const obtenerFechaLocal = () => {
  const d = new Date();
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

// Convierte una fecha YYYY-MM-DD a DD-MM-YYYY para visualización.
// Si el formato no coincide, devuelve el valor original sin romper la UI.
export const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const valor = String(fecha).trim();
  const match = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return valor;
  return `${match[3]}-${match[2]}-${match[1]}`;
};
