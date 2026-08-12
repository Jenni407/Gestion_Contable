package com.oficinacontable.gestionClientes.service;

import com.oficinacontable.gestionClientes.dto.DeclaracionDTO;
import com.oficinacontable.gestionClientes.model.Cliente;
import com.oficinacontable.gestionClientes.model.DeclaracionMensual;
import com.oficinacontable.gestionClientes.repository.ClienteRepository;
import com.oficinacontable.gestionClientes.repository.DeclaracionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DeclaracionService {

    private final DeclaracionRepository declaracionRepository;
    private final ClienteRepository clienteRepository;

    public DeclaracionService(DeclaracionRepository declaracionRepository, ClienteRepository clienteRepository) {
        this.declaracionRepository = declaracionRepository;
        this.clienteRepository = clienteRepository;
    }

    public List<DeclaracionMensual> obtenerPorRegimen(String regimen, Integer anio) {
        return declaracionRepository.findByRegimenAndAnio(regimen, anio);
    }

    public DeclaracionMensual registrarDeclaracion(DeclaracionDTO dto) {
        Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con ID: " + dto.getIdCliente()));

        Optional<DeclaracionMensual> declaracionOpt = declaracionRepository
                .findByClienteIdClienteAndAnioAndMesAndTipoImpuesto(
                        dto.getIdCliente(), dto.getAnio(), dto.getMes(), dto.getTipoImpuesto()
                );

        DeclaracionMensual declaracion = declaracionOpt.orElseGet(DeclaracionMensual::new);

        declaracion.setCliente(cliente);
        declaracion.setAnio(dto.getAnio());
        declaracion.setMes(dto.getMes());
        declaracion.setTipoImpuesto(dto.getTipoImpuesto() != null ? dto.getTipoImpuesto() : "IVA_PEQUENO");
        declaracion.setNumeroFormularioSat(dto.getNumeroFormularioSat());
        declaracion.setFechaPresentacion(dto.getFechaPresentacion());
        declaracion.setObservacionesBitacora(dto.getObservacionesBitacora());

        // Si ingresó fecha de presentación, pasa automáticamente a PRESENTADO (Verde)
        if (dto.getFechaPresentacion() != null && !dto.getFechaPresentacion().isBlank()) {
            declaracion.setEstadoSemaforo("PRESENTADO");
        } else {
            declaracion.setEstadoSemaforo("PENDIENTE");
        }

        return declaracionRepository.save(declaracion);
    }
}