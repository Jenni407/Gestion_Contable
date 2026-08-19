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
    
    List<DeclaracionMensual> findByAnio(Integer anio);
    
    // Consulta flexible: Convierte a minúsculas ambas partes para evitar fallos por mayúsculas/minúsculas
    @Query("SELECT d FROM DeclaracionMensual d WHERE LOWER(d.cliente.regimenFiscal) LIKE LOWER(CONCAT('%', :regimen, '%')) AND d.anio = :anio")
    List<DeclaracionMensual> findByRegimenAndAnio(@Param("regimen") String regimen, @Param("anio") Integer anio);

    Optional<DeclaracionMensual> findByClienteIdClienteAndAnioAndMesAndTipoImpuesto(
        Long idCliente, Integer anio, Integer mes, String tipoImpuesto
    );

    List<DeclaracionMensual> findByClienteIdClienteAndAnio(Long idCliente, Integer anio);

    Optional<DeclaracionMensual> findByClienteIdClienteAndAnioAndMes(Long idCliente, Integer anio, Integer mes);

    List<DeclaracionMensual> findByClienteNit(String nit);
}