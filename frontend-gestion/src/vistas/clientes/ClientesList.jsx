import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import ModalAcceso from '../../components/modals/ModalAcceso';
import ClienteFormModal from '../../components/forms/ClienteForm';
import Boton from '../../components/ui/Boton';
import { PlusIcon } from '../../components/icons/Icons';

export default function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditar, setClienteEditar] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  };

  const handleNuevoCliente = () => {
    setClienteEditar(null);
    setModalAbierto(true);
  };

  const handleEditarCliente = (cliente) => {
    setClienteEditar(cliente);
    setModalAbierto(true);
  };

  const handleToggleEstado = async (cliente) => {
    const id = cliente.idCliente || cliente.id;
    const nuevoEstado = cliente.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    try {
      await api.put(`/clientes/${id}`, {
        ...cliente,
        estado: nuevoEstado
      });
      cargarClientes();
    } catch (err) {
      console.error('Error al cambiar el estado del cliente:', err);
      alert('No se pudo modificar el estado');
    }
  };

  const handleAbrirAccesos = async (cliente) => {
    try {
      const id = cliente.idCliente || cliente.id;
      const res = await api.get(`/clientes/${id}/accesos`);

      setClienteSeleccionado({
        id: id,
        nombre: cliente.nombreRazonSocial || cliente.nombre,
        claveAV: res.data.claveAV || '',
        claveFEL: res.data.claveFEL || '',
        claveCorreo: res.data.claveCorreo || ''
      });
    } catch (err) {
      console.error("Error al obtener credenciales:", err);
      alert("No se pudieron cargar las credenciales desencriptadas");
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
    const term = busqueda.toLowerCase();
    const nit = c.nit ? c.nit.toLowerCase() : '';
    const nombre = (c.nombreRazonSocial || c.nombre || '').toLowerCase();
    return nit.includes(term) || nombre.includes(term);
  });

  return (
    <div className="manager-card">
      <div className="header-actions">
        <div>
          <h2>Gestión de Clientes</h2>
          <p className="subtitle">Listado general de contribuyentes registrados</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por NIT o Nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Boton className="btn-primary" onClick={handleNuevoCliente} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusIcon />
            <span>Nuevo Cliente</span>
          </Boton>
        </div>
      </div>

      <table className="custom-table">
        <thead>
          <tr>
            <th>NIT</th>
            <th>NOMBRE / RAZÓN SOCIAL</th>
            <th>FECHA NACIMIENTO</th>
            <th>RÉGIMEN FISCAL</th>
            <th>CORREO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map((cliente) => {
            const id = cliente.idCliente || cliente.id;
            const esActivo = cliente.estado === 'ACTIVO';

            return (
              <tr key={id}>
                <td><strong>{cliente.nit}</strong></td>
                <td>{cliente.nombreRazonSocial || cliente.nombre}</td>
                <td>{cliente.fechaNacimiento || '---'}</td>
                <td>{cliente.regimenFiscal}</td>
                <td>{cliente.correoElectronico || cliente.correo}</td>
                <td>
                  <span className={`status-badge ${esActivo ? 'activo' : 'inactivo'}`}>
                    {cliente.estado || 'ACTIVO'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Boton tipoAccion="clave" onClick={() => handleAbrirAccesos(cliente)} />
                    <Boton tipoAccion="editar" onClick={() => handleEditarCliente(cliente)} />
                    <Boton 
                      tipoAccion={esActivo ? "inactivar" : "activar"} 
                      title={esActivo ? 'Inactivar Cliente' : 'Activar Cliente'}
                      onClick={() => handleToggleEstado(cliente)} 
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal Registro/Edición */}
      {modalAbierto && (
        <ClienteFormModal
          clienteEditar={clienteEditar}
          onClose={() => setModalAbierto(false)}
          onSuccess={cargarClientes}
        />
      )}

      {/* Modal de Bóveda de Contraseñas */}
      {clienteSeleccionado && (
        <ModalAcceso
          cliente={clienteSeleccionado}
          onClose={() => setClienteSeleccionado(null)}
          onUpdate={cargarClientes}
        />
      )}
    </div>
  );
}