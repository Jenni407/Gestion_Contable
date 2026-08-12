package com.oficinacontable.gestionClientes.repository;

import com.oficinacontable.gestionClientes.model.DeclaracionMensual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeclaracionRepository extends JpaRepository<DeclaracionMensual, Long> {
    
    // Busca todas las declaraciones de un año específico
    List<DeclaracionMensual> findByAnio(Integer anio);
    
    // Buscar declaraciones por régimen del cliente y año
    @Query("SELECT d FROM DeclaracionMensual d WHERE d.cliente.regimenFiscal = :regimen AND d.anio = :anio")
    List<DeclaracionMensual> findByRegimenAndAnio(@Param("regimen") String regimen, @Param("anio") Integer anio);

    // Buscar declaración específica para evitar duplicados al registrar
    Optional<DeclaracionMensual> findByClienteIdClienteAndAnioAndMesAndTipoImpuesto(
        Long idCliente, Integer anio, Integer mes, String tipoImpuesto
    );

    // Listar por cliente
    List<DeclaracionMensual> findByClienteIdClienteAndAnio(Long idCliente, Integer anio);

    // Busca un registro único por cliente, año y mes
    Optional<DeclaracionMensual> findByClienteIdClienteAndAnioAndMes(Long idCliente, Integer anio, Integer mes);
}

