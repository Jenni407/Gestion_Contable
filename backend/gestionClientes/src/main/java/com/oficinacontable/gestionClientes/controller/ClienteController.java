package com.oficinacontable.gestionClientes.controller;

import com.oficinacontable.gestionClientes.model.Cliente;
import com.oficinacontable.gestionClientes.repository.ClienteRepository;
import com.oficinacontable.gestionClientes.service.EventoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EventoService eventoService;

    @GetMapping
    public List<Cliente> obtenerClientes() {
        return clienteRepository.findAll();
    }

    @PostMapping
    public Cliente guardarCliente(@RequestBody Cliente cliente) {
        Cliente guardado = clienteRepository.save(cliente);
        eventoService.publicar(EventoService.TOPIC_CLIENTES, "CLIENTE", "CREAR", guardado.getIdCliente());
        return guardado;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizarCliente(@PathVariable Long id, @RequestBody Cliente clienteDetalles) {
        return clienteRepository.findById(id).map(clienteExistente -> {
            clienteExistente.setNit(clienteDetalles.getNit());
            clienteExistente.setNombreRazonSocial(clienteDetalles.getNombreRazonSocial());
            clienteExistente.setRegimenFiscal(clienteDetalles.getRegimenFiscal());
            clienteExistente.setTelefono(clienteDetalles.getTelefono());
            clienteExistente.setAplicaIvaGeneral(clienteDetalles.getAplicaIvaGeneral());
            clienteExistente.setAplicaIsrt(clienteDetalles.getAplicaIsrt());
            clienteExistente.setAplicaRetencionIsr(clienteDetalles.getAplicaRetencionIsr());
            clienteExistente.setFechaNacimiento(clienteDetalles.getFechaNacimiento());
            clienteExistente.setCorreoElectronico(clienteDetalles.getCorreoElectronico());
            clienteExistente.setEstado(clienteDetalles.getEstado());
            Cliente guardado = clienteRepository.save(clienteExistente);
            eventoService.publicar(EventoService.TOPIC_CLIENTES, "CLIENTE", "ACTUALIZAR", id);
            return ResponseEntity.ok(guardado);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint público con validación por NIT y opcionalmente Teléfono
    @GetMapping("/publico/{nit}")
    public ResponseEntity<?> obtenerClientePublico(
            @PathVariable String nit,
            @RequestParam(required = false) String telefono) {

        return clienteRepository.findByNit(nit).map(cliente -> {
            // Validar teléfono si fue proporcionado en la consulta pública
            if (telefono != null && !telefono.trim().isEmpty()) {
                String telRegistrado = cliente.getTelefono() != null ? cliente.getTelefono().replaceAll("\\s+", "") : "";
                String telIngresado = telefono.replaceAll("\\s+", "");

                if (!telRegistrado.equalsIgnoreCase(telIngresado)) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("mensaje", "El número de teléfono no coincide con el NIT ingresado."));
                }
            }

            return ResponseEntity.ok((Object) cliente);
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("mensaje", "Cliente no encontrado con el NIT proporcionado.")));
    }
}
