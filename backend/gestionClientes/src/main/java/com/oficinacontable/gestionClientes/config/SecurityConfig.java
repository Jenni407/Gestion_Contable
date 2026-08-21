package com.oficinacontable.gestionClientes.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos de autenticación
                .requestMatchers(HttpMethod.POST,
                        "/api/usuarios/login",
                        "/api/usuarios/recuperar-password",
                        "/api/usuarios/restablecer-password").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()
                
                // ACCESO PÚBLICO PARA CLIENTES Y DECLARACIONES
                .requestMatchers(HttpMethod.GET, "/api/clientes/publico/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/declaraciones/publico/**").permitAll() 

                // Handshake de WebSocket (solo notificaciones de cambio, sin datos sensibles)
                .requestMatchers("/ws/**").permitAll()

                // Endpoints restringidos a roles administrativos
                .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.PUT, "/api/usuarios/**").hasRole("ADMINISTRADOR")
                
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex.authenticationEntryPoint(restAuthenticationEntryPoint()))
            .addFilterBefore(new JwtAuthenticationFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationEntryPoint restAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"mensaje\":\"No autorizado: inicie sesión o su token ha expirado.\"}");
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split("\\s*,\\s*")));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}