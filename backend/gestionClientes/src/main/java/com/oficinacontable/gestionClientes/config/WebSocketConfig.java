package com.oficinacontable.gestionClientes.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Temas que los clientes pueden suscribirse (ej. /topic/declaraciones)
        config.enableSimpleBroker("/topic");
        // Prefijo para mensajes enviados desde el cliente hacia el servidor (no se usa por ahora)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint de handshake. Solo notifica cambios (sin datos sensibles),
        // por eso se permite cualquier origen; los datos siguen protegidos por JWT en la API.
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }
}
