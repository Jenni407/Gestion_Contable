package com.oficinacontable.gestionClientes.controller;

import com.oficinacontable.gestionClientes.config.EncriptacionUtil;
import com.oficinacontable.gestionClientes.model.Cliente;
import com.oficinacontable.gestionClientes.model.CredencialCliente;
import com.oficinacontable.gestionClientes.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping
    public List<Cliente> obtenerClientes() {
        List<Cliente> clientes = clienteRepository.findAll();
        // Anular credenciales en la lista para no exponer strings cifrados innecesariamente
        clientes.forEach(c -> {
            if (c.getCredencial() != null) {
                c.getCredencial().setPassAgenciaVirtual(null);
                c.getCredencial().setPassFel(null);
                c.getCredencial().setPassCorreo(null);
            }
        });
        return clientes;
    }

    @PostMapping
    public Cliente guardarCliente(@RequestBody Cliente cliente) {
        if (cliente.getCredencial() != null) {
            CredencialCliente creds = cliente.getCredencial();
            creds.setPassAgenciaVirtual(EncriptacionUtil.encriptar(creds.getPassAgenciaVirtual()));
            creds.setPassFel(EncriptacionUtil.encriptar(creds.getPassFel()));
            creds.setPassCorreo(EncriptacionUtil.encriptar(creds.getPassCorreo()));
            creds.setCliente(cliente);
        }
        return clienteRepository.save(cliente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizarCliente(@PathVariable Long id, @RequestBody Cliente clienteDetalles) {
        return clienteRepository.findById(id).map(clienteExistente -> {
            clienteExistente.setNit(clienteDetalles.getNit());
            clienteExistente.setNombreRazonSocial(clienteDetalles.getNombreRazonSocial());
            clienteExistente.setRegimenFiscal(clienteDetalles.getRegimenFiscal());
            
            // --- CAMPO TELÉFONO AGREGADO ---
            clienteExistente.setTelefono(clienteDetalles.getTelefono());
            // --------------------------------

            // Configuraciones de Impuestos para Régimen General
            clienteExistente.setAplicaIvaGeneral(clienteDetalles.getAplicaIvaGeneral());
            clienteExistente.setAplicaIsrt(clienteDetalles.getAplicaIsrt());
            clienteExistente.setAplicaRetencionIsr(clienteDetalles.getAplicaRetencionIsr());

            clienteExistente.setFechaNacimiento(clienteDetalles.getFechaNacimiento());
            clienteExistente.setCorreoElectronico(clienteDetalles.getCorreoElectronico());
            clienteExistente.setEstado(clienteDetalles.getEstado());

            // Actualizar credenciales si vienen en la petición
            if (clienteDetalles.getCredencial() != null) {
                CredencialCliente credsNuevas = clienteDetalles.getCredencial();
                CredencialCliente credsExistentes = clienteExistente.getCredencial();

                if (credsExistentes == null) {
                    credsExistentes = new CredencialCliente();
                    credsExistentes.setCliente(clienteExistente);
                }

                if (credsNuevas.getPassAgenciaVirtual() != null && !credsNuevas.getPassAgenciaVirtual().isEmpty()) {
                    credsExistentes.setPassAgenciaVirtual(EncriptacionUtil.encriptar(credsNuevas.getPassAgenciaVirtual()));
                }
                if (credsNuevas.getPassFel() != null && !credsNuevas.getPassFel().isEmpty()) {
                    credsExistentes.setPassFel(EncriptacionUtil.encriptar(credsNuevas.getPassFel()));
                }
                if (credsNuevas.getPassCorreo() != null && !credsNuevas.getPassCorreo().isEmpty()) {
                    credsExistentes.setPassCorreo(EncriptacionUtil.encriptar(credsNuevas.getPassCorreo()));
                }

                clienteExistente.setCredencial(credsExistentes);
            }

            Cliente clienteActualizado = clienteRepository.save(clienteExistente);
            return ResponseEntity.ok(clienteActualizado);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/accesos")
    public ResponseEntity<?> obtenerAccesos(@PathVariable Long id) {
        Cliente cliente = clienteRepository.findById(id).orElse(null);
        if (cliente == null) {
            return ResponseEntity.status(404).body(Map.of("mensaje", "Cliente no encontrado"));
        }

        Map<String, String> accesos = new HashMap<>();
        if (cliente.getCredencial() != null) {
            accesos.put("claveAV", EncriptacionUtil.desencriptar(cliente.getCredencial().getPassAgenciaVirtual()));
            accesos.put("claveFEL", EncriptacionUtil.desencriptar(cliente.getCredencial().getPassFel()));
            accesos.put("claveCorreo", EncriptacionUtil.desencriptar(cliente.getCredencial().getPassCorreo()));
        } else {
            accesos.put("claveAV", "");
            accesos.put("claveFEL", "");
            accesos.put("claveCorreo", "");
        }

        return ResponseEntity.ok(accesos);
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

            // Ocultar credenciales en la consulta pública
            cliente.setCredencial(null);
            return ResponseEntity.ok((Object) cliente);
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("mensaje", "Cliente no encontrado con el NIT proporcionado.")));
    }
}