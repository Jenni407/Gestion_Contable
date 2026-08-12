import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// INTERCEPTOR: Adjunta automáticamente el Token JWT guardado en localStorage a cada petición HTTP
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
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
  obtenerAccesos: (id) => api.get(`/clientes/${id}/accesos`),
  crear: (cliente) => api.post('/clientes', cliente),
  actualizar: (id, cliente) => api.put(`/clientes/${id}`, cliente),
  eliminar: (id) => api.delete(`/clientes/${id}`)
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
  guardar: (datos) => api.post('/declaraciones/guardar', datos), 
  actualizarEstado: (idDeclaracion, datos) => api.put(`/declaraciones/${idDeclaracion}`, datos)
};

export default api;