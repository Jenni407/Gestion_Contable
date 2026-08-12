package com.oficinacontable.gestionClientes.controller;

import com.oficinacontable.gestionClientes.model.DeclaracionMensual;
import com.oficinacontable.gestionClientes.repository.DeclaracionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/declaraciones")
@CrossOrigin(origins = "*")
public class DeclaracionMensualController {

    @Autowired
    private DeclaracionRepository repository;

    // GET /api/declaraciones/pequeno-contribuyente?anio=2026
    @GetMapping("/pequeno-contribuyente")
    public ResponseEntity<List<DeclaracionMensual>> obtenerPequenosContribuyentes(@RequestParam Integer anio) {
        try {
            List<DeclaracionMensual> lista = repository.findByRegimenAndAnio("Pequeño Contribuyente", anio);
            return ResponseEntity.ok(lista != null ? lista : Collections.emptyList());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }

    // GET /api/declaraciones/regimen-general?anio=2026
    @GetMapping("/regimen-general")
    public ResponseEntity<List<DeclaracionMensual>> obtenerRegimenGeneral(@RequestParam Integer anio) {
        try {
            List<DeclaracionMensual> lista = repository.findByRegimenAndAnio("Régimen General", anio);
            return ResponseEntity.ok(lista != null ? lista : Collections.emptyList());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }

    // GET /api/declaraciones/tablero?anio=2026
    @GetMapping("/tablero")
    public ResponseEntity<List<DeclaracionMensual>> obtenerTableroPorAnio(@RequestParam Integer anio) {
        try {
            List<DeclaracionMensual> lista = repository.findByAnio(anio);
            return ResponseEntity.ok(lista != null ? lista : Collections.emptyList());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }

    // GET /api/declaraciones
    @GetMapping
    public ResponseEntity<List<DeclaracionMensual>> obtenerTodas() {
        try {
            List<DeclaracionMensual> lista = repository.findAll();
            return ResponseEntity.ok(lista != null ? lista : Collections.emptyList());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }

    // POST /api/declaraciones/guardar
    @PostMapping("/guardar")
    public ResponseEntity<?> guardarOActualizar(@RequestBody DeclaracionMensual datos) {
        if (datos.getCliente() == null || datos.getCliente().getIdCliente() == null) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El cliente es obligatorio"));
        }

        try {
            String tipoImpuesto = datos.getTipoImpuesto() != null ? datos.getTipoImpuesto() : "IVA_PEQUENO";

            // Buscar si ya existe la declaración tomando en cuenta el tipoImpuesto
            Optional<DeclaracionMensual> existente = repository.findByClienteIdClienteAndAnioAndMesAndTipoImpuesto(
                datos.getCliente().getIdCliente(), datos.getAnio(), datos.getMes(), tipoImpuesto
            );

            DeclaracionMensual aGuardar;
            if (existente.isPresent()) {
                aGuardar = existente.get();
                aGuardar.setEstadoSemaforo(datos.getEstadoSemaforo());
                aGuardar.setNumeroFormularioSat(datos.getNumeroFormularioSat());
                aGuardar.setFechaPresentacion(datos.getFechaPresentacion());
                aGuardar.setRutaComprobantePdf(datos.getRutaComprobantePdf());
                aGuardar.setObservacionesBitacora(datos.getObservacionesBitacora());
            } else {
                aGuardar = datos;
                aGuardar.setTipoImpuesto(tipoImpuesto);
            }

            DeclaracionMensual guardado = repository.save(aGuardar);
            return ResponseEntity.ok(guardado);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al procesar la declaración: " + e.getMessage()));
        }
    }
}