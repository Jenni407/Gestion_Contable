import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';

// Deriva la URL del WebSocket a partir de VITE_WS_URL o de la URL del API.
// - Producción (VITE_API_URL=/api): wss://dominio/ws
// - Desarrollo: ws://localhost:8080/ws
const derivarWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  if (base.startsWith('http')) {
    return `${base.replace(/^http/, 'ws').replace(/\/api\/?$/, '')}/ws`;
  }
  const protocolo = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocolo}://${window.location.host}/ws`;
};

const TOPICOS = [
  '/topic/clientes',
  '/topic/declaraciones',
  '/topic/credenciales',
  '/topic/usuarios'
];

/**
 * Mantiene una conexión WebSocket/STOMP activa mientras `habilitado` sea true.
 * Ejecuta `onEvento` cada vez que cualquier usuario del sistema registra un cambio.
 * Incluye reconexión automática cada 5 segundos si se cae la conexión.
 */
export function useEventosTiempoReal(habilitado, onEvento) {
  const callbackRef = useRef(onEvento);
  callbackRef.current = onEvento;

  useEffect(() => {
    if (!habilitado || !window.WebSocket) return undefined;

    const client = new Client({
      webSocketFactory: () => new WebSocket(derivarWsUrl()),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        TOPICOS.forEach((topico) => {
          client.subscribe(topico, () => callbackRef.current?.());
        });
      }
    });

    client.activate();

    return () => {
      client.deactivate().catch(() => {});
    };
  }, [habilitado]);
}
