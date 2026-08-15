package com.oficinacontable.gestionClientes.config;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * Omite el procesamiento del filtro JWT para peticiones públicas.
     * Evita que tokens persistentes en el navegador (de Contador u otros roles)
     * interfieran con el acceso libre a login o recuperación de contraseña.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        return "POST".equalsIgnoreCase(method) && (
                path.equals("/api/usuarios/login") ||
                path.equals("/api/usuarios/recuperar-password") ||
                path.equals("/api/usuarios/restablecer-password")
        );
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtUtil.obtenerClaims(token);
                String correo = claims.getSubject();
                String rol = claims.get("rol", String.class);

                // Validar que el token sea de sesión (que tenga rol) y no un token temporal de recuperación
                if (correo != null && rol != null && claims.getExpiration().after(new Date())) {
                    var authentication = new UsernamePasswordAuthenticationToken(
                            correo,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + rol.toUpperCase()))
                    );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // En caso de token inválido o manipulado, se limpia el contexto para impedir acceso
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}