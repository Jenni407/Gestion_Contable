package com.oficinacontable.gestionClientes.repository;

import com.oficinacontable.gestionClientes.model.Credencial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CredencialRepository extends JpaRepository<Credencial, Long> {

    List<Credencial> findByClienteIdClienteOrderByServicioAsc(Long idCliente);

    Optional<Credencial> findByIdCredencialAndClienteIdCliente(Long idCredencial, Long idCliente);
}
