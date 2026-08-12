package com.oficinacontable.gestionClientes.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.jwt.secreto:ClaveSecretaSuperSeguraParaRecuperacion12345!}")
    private String secreto;

    @Value("${app.jwt.expiracionRecuperacionMs:900000}")
    private long expiracionRecuperacionMs;

    @Value("${app.jwt.expiracionLoginMs:86400000}")
    private long expiracionLoginMs;

    private Key obtenerLlave() {
        return Keys.hmacShaKeyFor(secreto.getBytes());
    }

    public String generarTokenRecuperacion(String correo, String codigo) {
        return Jwts.builder()
                .setSubject(correo)
                .claim("codigo", codigo)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiracionRecuperacionMs))
                .signWith(obtenerLlave(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generarTokenLogin(String correo, String rol) {
        return Jwts.builder()
                .setSubject(correo)
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiracionLoginMs))
                .signWith(obtenerLlave(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims obtenerClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(obtenerLlave())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String obtenerUsuario(String token) {
        return obtenerClaims(token).getSubject();
    }

    public boolean esTokenValido(String token) {
        try {
            return obtenerClaims(token).getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
