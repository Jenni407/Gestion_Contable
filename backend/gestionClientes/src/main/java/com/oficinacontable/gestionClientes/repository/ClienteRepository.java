package com.oficinacontable.gestionClientes.repository;

import com.oficinacontable.gestionClientes.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    // Búsqueda por NIT
    Optional<Cliente> findByNit(String nit);

    // Búsqueda por NIT y Teléfono para la validación del acceso público
    Optional<Cliente> findByNitAndTelefono(String nit, String telefono);
}