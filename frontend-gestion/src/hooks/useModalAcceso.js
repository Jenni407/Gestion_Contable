import { useState, useEffect, useCallback } from 'react';
import { CredencialesAPI } from '../api/axiosConfig';

export function useModalAccesos(cliente) {
  const [credenciales, setCredenciales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [contraseñasVisibles, setContraseñasVisibles] = useState({});
  const [copiado, setCopiado] = useState('');

  const idCliente = cliente?.id ?? cliente?.idCliente;

  const cargar = useCallback(async () => {
    if (!idCliente) return;
    try {
      setCargando(true);
      const res = await CredencialesAPI.listar(idCliente);
      setCredenciales(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error al cargar credenciales:', e);
    } finally {
      setCargando(false);
    }
  }, [idCliente]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const obtenerContrasena = async (id) => {
    const res = await CredencialesAPI.obtener(idCliente, id);
    const pwd = res.data.password || '';
    setCredenciales((prev) => prev.map((c) => (c.id === id ? { ...c, password: pwd } : c)));
    return pwd;
  };

  const verContrasena = async (id) => {
    try {
      await obtenerContrasena(id);
      setContraseñasVisibles((prev) => ({ ...prev, [id]: true }));
    } catch (e) {
      console.error('Error al descifrar credencial:', e);
    }
  };

  const ocultarContrasena = (id) => {
    setContraseñasVisibles((prev) => ({ ...prev, [id]: false }));
    setCredenciales((prev) => prev.map((c) => (c.id === id ? { ...c, password: undefined } : c)));
  };

  const copiarAlPortapapeles = async (id) => {
    try {
      const cred = credenciales.find((c) => c.id === id);
      const pwd = cred?.password ?? (await obtenerContrasena(id));
      await navigator.clipboard.writeText(pwd);
      setCopiado(String(id));
      setTimeout(() => setCopiado(''), 2000);
    } catch (e) {
      console.error('Error al copiar:', e);
    }
  };

  const guardar = async (datos, id) => {
    if (id) {
      await CredencialesAPI.actualizar(idCliente, id, datos);
    } else {
      await CredencialesAPI.crear(idCliente, datos);
    }
    await cargar();
  };

  const eliminar = async (id) => {
    await CredencialesAPI.eliminar(idCliente, id);
    await cargar();
  };

  return {
    credenciales,
    cargando,
    contraseñasVisibles,
    copiado,
    cargar,
    verContrasena,
    ocultarContrasena,
    copiarAlPortapapeles,
    guardar,
    eliminar
  };
}
