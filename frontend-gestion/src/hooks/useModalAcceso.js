import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export function useModalAccesos(cliente) {
  const [copiado, setCopiado] = useState('');
  const [mostrarClave, setMostrarClave] = useState({ AV: false, FEL: false, Correo: false });
  const [credenciales, setCredenciales] = useState({ claveAV: '', claveFEL: '', claveCorreo: '' });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerAccesos = async () => {
      if (!cliente?.id) return;
      try {
        setCargando(true);
        const res = await api.get(`/clientes/${cliente.id}/accesos`);
        setCredenciales(res.data);
      } catch (error) {
        console.error('Error al cargar las credenciales:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerAccesos();
  }, [cliente]);

  const copiarAlPortapapeles = (texto, tipo) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(''), 2000);
  };

  const toggleMostrar = (tipo) => {
    setMostrarClave((prev) => ({ ...prev, [tipo]: !prev[tipo] }));
  };

  return {
    copiado,
    mostrarClave,
    credenciales,
    cargando,
    copiarAlPortapapeles,
    toggleMostrar
  };
}