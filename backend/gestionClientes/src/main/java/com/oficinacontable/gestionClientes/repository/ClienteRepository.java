package com.oficinacontable.gestionClientes.repository;

import com.oficinacontable.gestionClientes.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

}
  