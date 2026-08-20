package com.oficinacontable.gestionClientes.config;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secreto", "clave-super-segura-para-pruebas-jwt-1234567890");
        ReflectionTestUtils.setField(jwtUtil, "expiracionLoginMs", 60000L);
        ReflectionTestUtils.setField(jwtUtil, "expiracionRecuperacionMs", 60000L);
    }

    @Test
    void generarTokenLoginContieneCorreoYRol() {
        String token = jwtUtil.generarTokenLogin("carlos@correo.com", "ADMINISTRADOR");

        assertNotNull(token);
        assertTrue(jwtUtil.esTokenValido(token));
        assertEquals("carlos@correo.com", jwtUtil.obtenerUsuario(token));

        Claims claims = jwtUtil.obtenerClaims(token);
        assertEquals("ADMINISTRADOR", claims.get("rol", String.class));
    }

    @Test
    void generarTokenRecuperacionContieneCodigo() {
        String token = jwtUtil.generarTokenRecuperacion("carlos@correo.com", "123456");

        Claims claims = jwtUtil.obtenerClaims(token);
        assertEquals("123456", claims.get("codigo", String.class));
        assertEquals("carlos@correo.com", claims.getSubject());
    }

    @Test
    void tokenInvalidoNoEsValido() {
        assertFalse(jwtUtil.esTokenValido("token-invalido"));
        assertFalse(jwtUtil.esTokenValido(""));
    }
}
