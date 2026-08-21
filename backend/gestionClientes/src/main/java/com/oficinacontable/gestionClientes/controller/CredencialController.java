package com.oficinacontable.gestionClientes.controller;

import com.oficinacontable.gestionClientes.config.EncriptacionUtil;
import com.oficinacontable.gestionClientes.dto.CredencialDTO;
import com.oficinacontable.gestionClientes.model.Cliente;
import com.oficinacontable.gestionClientes.model.Credencial;
import com.oficinacontable.gestionClientes.repository.ClienteRepository;
import com.oficinacontable.gestionClientes.repository.CredencialRepository;
import com.oficinacontable.gestionClientes.service.EventoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes/{idCliente}/credenciales")
public class CredencialController {

    private final CredencialRepository credencialRepository;
    private final ClienteRepository clienteRepository;
    private final EventoService eventoService;

    public CredencialController(CredencialRepository credencialRepository, ClienteRepository clienteRepository, EventoService eventoService) {
        this.credencialRepository = credencialRepository;
        this.clienteRepository = clienteRepository;
        this.eventoService = eventoService;
    }

    // Lista las credenciales SIN contraseñas (solo metadatos + servicio)
    @GetMapping
    public ResponseEntity<List<CredencialDTO>> listar(@PathVariable Long idCliente) {
        List<CredencialDTO> lista = credencialRepository
                .findByClienteIdClienteOrderByServicioAsc(idCliente)
                .stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(lista);
    }

    // Devuelve una credencial descifrada bajo demanda (sesión autenticada)
    @GetMapping("/{id}")
    public ResponseEntity<CredencialDTO> obtener(@PathVariable Long idCliente, @PathVariable Long id) {
        return credencialRepository.findByIdCredencialAndClienteIdCliente(id, idCliente)
                .map(c -> {
                    CredencialDTO dto = toDTO(c);
                    dto.setPassword(EncriptacionUtil.desencriptar(c.getPasswordCifrada()));
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crear(@PathVariable Long idCliente, @RequestBody CredencialDTO dto) {
        if (dto.getServicio() == null || dto.getServicio().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El servicio es obligatorio."));
        }
        Cliente cliente = clienteRepository.findById(idCliente).orElse(null);
        if (cliente == null) {
            return ResponseEntity.status(404).body(Map.of("mensaje", "Cliente no encontrado."));
        }

        Credencial c = new Credencial();
        c.setCliente(cliente);
        c.setServicio(dto.getServicio().trim());
        c.setUsuario(dto.getUsuario());
        c.setUrl(dto.getUrl());
        c.setNotas(dto.getNotas());
        c.setPasswordCifrada(EncriptacionUtil.encriptar(dto.getPassword()));

        Credencial guardada = credencialRepository.save(c);
        eventoService.publicar(EventoService.TOPIC_CREDENCIALES, "CREDENCIAL", "CREAR", idCliente);
        return ResponseEntity.ok(toDTO(guardada));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long idCliente, @PathVariable Long id, @RequestBody CredencialDTO dto) {
        return credencialRepository.findByIdCredencialAndClienteIdCliente(id, idCliente)
                .map(c -> {
                    if (dto.getServicio() != null && !dto.getServicio().isBlank()) {
                        c.setServicio(dto.getServicio().trim());
                    }
                    c.setUsuario(dto.getUsuario());
                    c.setUrl(dto.getUrl());
                    c.setNotas(dto.getNotas());
                    // Solo re-cifra si viene una contraseña nueva (no vacía)
                    if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
                        c.setPasswordCifrada(EncriptacionUtil.encriptar(dto.getPassword()));
                    }
                    Credencial guardada = credencialRepository.save(c);
                    eventoService.publicar(EventoService.TOPIC_CREDENCIALES, "CREDENCIAL", "ACTUALIZAR", idCliente);
                    return ResponseEntity.ok(toDTO(guardada));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long idCliente, @PathVariable Long id) {
        return credencialRepository.findByIdCredencialAndClienteIdCliente(id, idCliente)
                .map(c -> {
                    credencialRepository.delete(c);
                    eventoService.publicar(EventoService.TOPIC_CREDENCIALES, "CREDENCIAL", "ELIMINAR", idCliente);
                    return ResponseEntity.ok(Map.of("mensaje", "Credencial eliminada."));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private CredencialDTO toDTO(Credencial c) {
        CredencialDTO dto = new CredencialDTO();
        dto.setId(c.getIdCredencial());
        dto.setServicio(c.getServicio());
        dto.setUsuario(c.getUsuario());
        dto.setUrl(c.getUrl());
        dto.setNotas(c.getNotas());
        return dto;
    }
}
