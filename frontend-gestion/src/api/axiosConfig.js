import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
});

// INTERCEPTOR: Adjunta automáticamente el Token JWT si existe en localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.url.includes('/usuarios/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper para guardar o remover el token del localStorage
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const ClientesAPI = {
  obtenerTodos: () => api.get('/clientes'),
  crear: (cliente) => api.post('/clientes', cliente),
  actualizar: (id, cliente) => api.put(`/clientes/${id}`, cliente),
  eliminar: (id) => api.delete(`/clientes/${id}`),
  // Endpoint público para consulta por NIT
  obtenerPorNitPublico: (nit) => api.get(`/clientes/publico/${nit}`)
};

export const CredencialesAPI = {
  listar: (idCliente) => api.get(`/clientes/${idCliente}/credenciales`),
  obtener: (idCliente, id) => api.get(`/clientes/${idCliente}/credenciales/${id}`),
  crear: (idCliente, datos) => api.post(`/clientes/${idCliente}/credenciales`, datos),
  actualizar: (idCliente, id, datos) => api.put(`/clientes/${idCliente}/credenciales/${id}`, datos),
  eliminar: (idCliente, id) => api.delete(`/clientes/${idCliente}/credenciales/${id}`)
};

export const UsuariosAPI = {
  obtenerTodos: () => api.get('/usuarios'),
  crear: (usuario) => api.post('/usuarios', usuario),
  actualizar: (id, usuario) => api.put(`/usuarios/${id}`, usuario),
  login: (credenciales) => api.post('/usuarios/login', credenciales)
};

export const DeclaracionesAPI = {
  obtenerTodas: () => api.get('/declaraciones'), 
  obtenerPorClienteYAnio: (idCliente, anio) => api.get(`/declaraciones/cliente/${idCliente}?anio=${anio}`),
  obtenerTableroAnio: (anio) => api.get(`/declaraciones/tablero?anio=${anio}`),

  // Métodos para las pestañas Pequeño Contribuyente y Régimen General
  obtenerPequenoContribuyente: (anio) => api.get(`/declaraciones/pequeno-contribuyente?anio=${anio}`),
  obtenerRegimenGeneral: (anio) => api.get(`/declaraciones/regimen-general?anio=${anio}`),

  // Método para el Portal Público (sin requerir token/login)
obtenerPublicoPorNit: (nit, telefono) => 
    api.get(`/declaraciones/publico/${nit}`, { 
      params: { telefono } 
    }),

    descargarComprobantePublico: (idDeclaracion) => 
    api.get(`/declaraciones/publico/descargar/${idDeclaracion}`, { responseType: 'blob' }),
    
  guardar: (datos) => api.post('/declaraciones/guardar', datos), 
  actualizarEstado: (idDeclaracion, datos) => api.put(`/declaraciones/${idDeclaracion}`, datos),

  subirComprobante: (formData) => api.post('/declaraciones/subir-comprobante', formData)
};
export default api;