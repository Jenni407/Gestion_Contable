package com.oficinacontable.gestionClientes.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Publica eventos de cambio en tiempo real vía WebSocket (STOMP) hacia /topic/{entidad}.
 * Los clientes suscritos refrescan sus datos al recibir la notificación.
 */
@Service
public class EventoService {

    public static final String TOPIC_CLIENTES = "/topic/clientes";
    public static final String TOPIC_DECLARACIONES = "/topic/declaraciones";
    public static final String TOPIC_CREDENCIALES = "/topic/credenciales";
    public static final String TOPIC_USUARIOS = "/topic/usuarios";

    private final SimpMessagingTemplate messagingTemplate;

    public EventoService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * @param entidad nombre del módulo (CLIENTE, DECLARACION, CREDENCIAL, USUARIO)
     * @param accion  acción realizada (CREAR, ACTUALIZAR, ELIMINAR, COMPROBANTE)
     * @param id      identificador del registro afectado (0 si no aplica)
     */
    public void publicar(String topico, String entidad, String accion, Long id) {
        try {
            messagingTemplate.convertAndSend(topico, Map.of(
                    "entidad", entidad,
                    "accion", accion,
                    "id", id != null ? id : 0L,
                    "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            // Un fallo de notificación nunca debe interrumpir la operación principal
            System.err.println(">>> No se pudo publicar el evento WebSocket: " + e.getMessage());
        }
    }
}
