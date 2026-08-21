package com.oficinacontable.gestionClientes.controller;

import com.oficinacontable.gestionClientes.model.DeclaracionMensual;
import com.oficinacontable.gestionClientes.repository.ClienteRepository;
import com.oficinacontable.gestionClientes.repository.DeclaracionRepository;
import com.oficinacontable.gestionClientes.service.Email;
import com.oficinacontable.gestionClientes.service.EventoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.io.File;
import java.nio.file.*;
import java.net.URI;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/declaraciones")
@CrossOrigin(origins = "*")
public class DeclaracionMensualController {

    @Autowired
    private DeclaracionRepository repository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private Email emailService;

    @Autowired
    private EventoService eventoService;

    // GET /api/declaraciones/pequeno-contribuyente?anio=2026
    @GetMapping("/pequeno-contribuyente")
    public ResponseEntity<List<DeclaracionMensual>> obtenerPequenosContribuyentes(@RequestParam Integer anio) {
        try {
            // Se envía 'peque' para que la query con LIKE de JPA capture cualquier variante
            List<DeclaracionMensual> lista = repository.findByRegimenAndAnio("peque", anio);
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
            // Se envía 'general' para asegurar coincidencias ignorando mayúsculas/minúsculas
            List<DeclaracionMensual> lista = repository.findByRegimenAndAnio("general", anio);
            return ResponseEntity.ok(lista != null ? lista : Collections.emptyList());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }

    // Endpoint para enviar los conteos numéricos directos al Panel Principal
    @GetMapping("/resumen-dashboard")
    public ResponseEntity<Map<String, Object>> obtenerResumenDashboard() {
        try {
            long totalClientes = clienteRepository.count();
            long totalDeclaraciones = repository.count();

            Map<String, Object> resumen = new HashMap<>();
            resumen.put("totalClientes", totalClientes);
            resumen.put("totalDeclaraciones", totalDeclaraciones);
            resumen.put("clientesActivos", totalClientes); // O clienteRepository.countByEstado("ACTIVO")

            return ResponseEntity.ok(resumen);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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

    // Consulta libre pública por NIT
    @GetMapping("/publico/{nit}")
    public ResponseEntity<?> obtenerPorNitPublico(
            @PathVariable String nit,
            @RequestParam(required = false) String telefono) {
        try {
            Optional<com.oficinacontable.gestionClientes.model.Cliente> clienteOpt = clienteRepository.findByNit(nit);
            
            if (clienteOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "No se encontró ningún contribuyente con el NIT ingresado."));
            }

            com.oficinacontable.gestionClientes.model.Cliente cliente = clienteOpt.get();

            if (telefono == null || telefono.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("mensaje", "Es necesario ingresar el número telefónico para la verificación."));
            }

            String telRegistrado = cliente.getTelefono() != null ? cliente.getTelefono().replaceAll("[\\s-]+", "") : "";
            String telIngresado = telefono.replaceAll("[\\s-]+", "");

            if (!telRegistrado.equals(telIngresado)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("mensaje", "El número de teléfono no coincide con nuestros registros."));
            }

            List<DeclaracionMensual> lista = repository.findByClienteNit(nit);
            return ResponseEntity.ok(lista != null ? lista : Collections.emptyList());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error interno al procesar la consulta pública."));
        }
    }

    // Descarga o redirige al comprobante PDF de una declaración (acceso público)
    @GetMapping("/publico/descargar/{id}")
    public ResponseEntity<?> descargarComprobante(@PathVariable Long id) {
        try {
            Optional<DeclaracionMensual> declaOpt = repository.findById(id);

            if (declaOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "No se encontró el comprobante de la declaración."));
            }

            String ruta = declaOpt.get().getRutaComprobantePdf();

            if (ruta == null || ruta.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("mensaje", "La declaración no tiene comprobante adjunto."));
            }

            // Si es una URL externa (ej. comprobante del SAT), redirigimos a ella
            if (ruta.startsWith("http://") || ruta.startsWith("https://")) {
                return ResponseEntity.status(HttpStatus.FOUND)
                        .location(URI.create(ruta.trim()))
                        .build();
            }

            // Si es una ruta local, intentamos servirlo como archivo PDF
            Path archivo = Paths.get(ruta);
            if (Files.exists(archivo)) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"comprobante-" + id + ".pdf\"")
                        .body(Files.readAllBytes(archivo));
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", "El archivo del comprobante no está disponible."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error interno al descargar el comprobante."));
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

            // Notificar en tiempo real a los clientes conectados
            eventoService.publicar(EventoService.TOPIC_DECLARACIONES, "DECLARACION", "GUARDAR", guardado.getIdDeclaracion());

            // Enviar correo de confirmación si la declaración quedó presentada
            boolean esPresentado = guardado.getEstadoSemaforo() != null &&
                (guardado.getEstadoSemaforo().trim().equalsIgnoreCase("PRESENTADO") ||
                 guardado.getEstadoSemaforo().trim().equalsIgnoreCase("VERDE") ||
                 guardado.getEstadoSemaforo().trim().equalsIgnoreCase("PAGADO") ||
                 (guardado.getFechaPresentacion() != null && !guardado.getFechaPresentacion().isBlank()));

            if (esPresentado) {
                clienteRepository.findById(guardado.getCliente().getIdCliente()).ifPresent(cliente -> {
                    String correoDestino = cliente.getCorreoElectronico();

                    if (correoDestino != null && !correoDestino.isBlank()) {
                        String periodoFormateado = String.format("%02d/%d", guardado.getMes(), guardado.getAnio());
                        String numeroFormulario = guardado.getNumeroFormularioSat() != null && !guardado.getNumeroFormularioSat().isBlank()
                            ? guardado.getNumeroFormularioSat() : "No registrado";

                        emailService.enviarNotificacionDeclaracion(
                            correoDestino,
                            cliente.getNombreRazonSocial(),
                            cliente.getNit(),
                            guardado.getTipoImpuesto(),
                            periodoFormateado,
                            numeroFormulario
                        );
                    }
                });
            }

            return ResponseEntity.ok(Map.of("mensaje", "Declaración guardada correctamente", "declaracion", guardado));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("mensaje", "Error al guardar la declaración"));
        }
    }

    //Endpoint para subir el PDF
@PostMapping("/subir-comprobante")
public ResponseEntity<?> subirComprobante(
        @RequestParam("idDeclaracion") Long idDeclaracion,
        @RequestParam("archivo") MultipartFile archivo) {
    try {
        if (archivo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El archivo está vacío"));
        }

        String carpetaDestino = "uploads/pdf/";
        File carpeta = new File(carpetaDestino);
        if (!carpeta.exists()) carpeta.mkdirs();

        String nombreArchivo = System.currentTimeMillis() + "_" + archivo.getOriginalFilename();
        Path rutaCompleta = Paths.get(carpetaDestino + nombreArchivo);
        Files.copy(archivo.getInputStream(), rutaCompleta, StandardCopyOption.REPLACE_EXISTING);

        Optional<DeclaracionMensual> declaOpt = repository.findById(idDeclaracion);
        if (declaOpt.isPresent()) {
            DeclaracionMensual decla = declaOpt.get();
            decla.setRutaComprobantePdf(rutaCompleta.toString());
            repository.save(decla);
            eventoService.publicar(EventoService.TOPIC_DECLARACIONES, "DECLARACION", "COMPROBANTE", idDeclaracion);
            return ResponseEntity.ok(Map.of("mensaje", "PDF subido con éxito", "ruta", rutaCompleta.toString()));
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", "Declaración no encontrada"));
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("mensaje", "Error al guardar el PDF"));
    }
}

// Endpoint público para ver/descargar el PDF
@GetMapping("/publico/comprobante/{id}")
public ResponseEntity<Resource> verComprobantePublico(@PathVariable Long id) {
    try {
        Optional<DeclaracionMensual> declaOpt = repository.findById(id);
        if (declaOpt.isEmpty() || declaOpt.get().getRutaComprobantePdf() == null) {
            return ResponseEntity.notFound().build();
        }

        Path rutaArchivo = Paths.get(declaOpt.get().getRutaComprobantePdf());
        Resource recurso = new UrlResource(rutaArchivo.toUri());

        if (!recurso.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + recurso.getFilename() + "\"")
                .body(recurso);

    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
}