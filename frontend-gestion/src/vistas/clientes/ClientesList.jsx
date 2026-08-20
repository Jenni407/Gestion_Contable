import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import ModalAcceso from '../../components/modals/ModalAcceso';
import ClienteFormModal from '../../components/forms/ClienteForm';
import Boton from '../../components/ui/Boton';
import { PlusIcon } from '../../components/icons/Icons';
import Paginador from '../../components/common/Paginador';

export default function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditar, setClienteEditar] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  const POR_PAGINA = 15;

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

  const handleAbrirAccesos = (cliente) => {
    const id = cliente.idCliente || cliente.id;
    setClienteSeleccionado({
      id,
      nombre: cliente.nombreRazonSocial || cliente.nombre
    });
  };

  const clientesFiltrados = clientes.filter((c) => {
    const term = busqueda.toLowerCase();
    const nit = c.nit ? c.nit.toLowerCase() : '';
    const nombre = (c.nombreRazonSocial || c.nombre || '').toLowerCase();
    const tel = (c.telefono || c.telefonoConfirmacion || c.celular || '').toLowerCase();
    return nit.includes(term) || nombre.includes(term) || tel.includes(term);
  });

  // Reinicia a la primera página cuando cambia la búsqueda
  useEffect(() => {
    setPagina(1);
  }, [busqueda]);

  const totalPaginas = Math.ceil(clientesFiltrados.length / POR_PAGINA);
  const paginaSegura = Math.min(pagina, Math.max(totalPaginas, 1));
  const clientesPagina = clientesFiltrados.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA);

  return (
    <div className="manager-card">
      <div className="header-actions">
        <div>
          <h2>Gestión de Clientes</h2>
          <p className="subtitle">Listado general de contribuyentes registrados</p>
        </div>
        <div className="header-actions-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por NIT, Nombre o Teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Boton className="btn-primary" onClick={handleNuevoCliente} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusIcon />
            <span>Nuevo Cliente</span>
          </Boton>
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr><th>NIT</th><th>NOMBRE / RAZÓN SOCIAL</th><th>TELÉFONO</th><th>FECHA NACIMIENTO</th><th>RÉGIMEN FISCAL</th><th>CORREO</th><th>ESTADO</th><th>ACCIONES</th></tr>
          </thead>
          <tbody>
            {clientesPagina.map((cliente) => {
              const id = cliente.idCliente || cliente.id;
              const esActivo = cliente.estado === 'ACTIVO';
              const numTelefono = cliente.telefono || cliente.telefonoConfirmacion || cliente.celular || '---';

              return (
                <tr key={id}>
                  <td><strong>{cliente.nit}</strong></td>
                  <td>{cliente.nombreRazonSocial || cliente.nombre}</td>
                  <td>{numTelefono}</td>
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
      </div>

      <Paginador total={clientesFiltrados.length} porPagina={POR_PAGINA} pagina={paginaSegura} onCambiarPagina={setPagina} />

      {modalAbierto && (
        <ClienteFormModal
          clienteEditar={clienteEditar}
          onClose={() => setModalAbierto(false)}
          onSuccess={cargarClientes}
        />
      )}

      {clienteSeleccionado && (
        <ModalAcceso
          cliente={clienteSeleccionado}
          onClose={() => setClienteSeleccionado(null)}
        />
      )}
    </div>
  );
}