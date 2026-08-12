package com.oficinacontable.gestionClientes.controller;

import com.oficinacontable.gestionClientes.config.JwtUtil;
import com.oficinacontable.gestionClientes.repository.UsuarioRepository;
import com.oficinacontable.gestionClientes.model.Usuario;
import com.oficinacontable.gestionClientes.service.Email;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final Email emailService;

    // Inyección constructor
    public UsuarioController(UsuarioRepository usuarioRepository, JwtUtil jwtUtil, Email emailService, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<Usuario> listarUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        usuarios.forEach(u -> u.setPasswordHash(null)); // No exponer hashes BCrypt
        return usuarios;
    }

    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody Usuario usuario) {
        if (usuario.getPasswordHash() != null && !usuario.getPasswordHash().isEmpty()) {
            // Encripta la contraseña en texto plano recibida
            String hashEncriptado = passwordEncoder.encode(usuario.getPasswordHash());
            usuario.setPasswordHash(hashEncriptado);
        }
        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        usuarioGuardado.setPasswordHash(null);
        return ResponseEntity.ok(usuarioGuardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizarUsuario(@PathVariable Long id, @RequestBody Usuario datosActualizados) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    if (datosActualizados.getNombre() != null) usuario.setNombre(datosActualizados.getNombre());
                    if (datosActualizados.getCorreo() != null) usuario.setCorreo(datosActualizados.getCorreo());
                    if (datosActualizados.getRol() != null) usuario.setRol(datosActualizados.getRol());
                    if (datosActualizados.getEstado() != null) usuario.setEstado(datosActualizados.getEstado());
                    
                    if (datosActualizados.getPasswordHash() != null && !datosActualizados.getPasswordHash().isEmpty()) {
                        usuario.setPasswordHash(passwordEncoder.encode(datosActualizados.getPasswordHash()));
                    }
                    Usuario guardado = usuarioRepository.save(usuario);
                    guardado.setPasswordHash(null);
                    return ResponseEntity.ok(guardado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody Map<String, String> loginReq) {
    // Busca el identificador 
    String identificador = loginReq.get("correo");
    if (identificador == null || identificador.trim().isEmpty()) {
        identificador = loginReq.get("nombre");
    }
    if (identificador == null || identificador.trim().isEmpty()) {
        identificador = loginReq.get("usuario");
    }
    if (identificador == null || identificador.trim().isEmpty()) {
        identificador = loginReq.get("identificador");
    }

    String password = loginReq.get("passwordHash");
    if (password == null) {
        password = loginReq.get("password");
    }

    if (identificador == null || password == null) {
        return ResponseEntity.badRequest().body(Map.of("mensaje", "Debe ingresar un usuario/correo y contraseña."));
    }

    // Busca en la BD si existe
    Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreoOrNombre(identificador.trim(), identificador.trim());

    if (usuarioOpt.isPresent()) {
        Usuario usuario = usuarioOpt.get();
        String hashBD = usuario.getPasswordHash();
        boolean match = false;

        if (hashBD != null) {
            if (hashBD.startsWith("$2a$") || hashBD.startsWith("$2b$") || hashBD.startsWith("$2y$")) {
                match = passwordEncoder.matches(password, hashBD);
            } else {
                match = hashBD.equals(password);
                if (match) {
                    usuario.setPasswordHash(passwordEncoder.encode(password));
                    usuarioRepository.save(usuario);
                }
            }
        }

        if ("INACTIVO".equalsIgnoreCase(usuario.getEstado())) {
            return ResponseEntity.status(403).body(Map.of("mensaje", "La cuenta se encuentra inactiva."));
        }
        
        if (match) {
            String token = jwtUtil.generarTokenLogin(usuario.getCorreo(), usuario.getRol());
            usuario.setPasswordHash(null); // No exponer el hash BCrypt en la respuesta
            return ResponseEntity.ok(Map.of(
                "token", token,
                "usuario", usuario
            ));
        }
    }
    return ResponseEntity.status(401).body(Map.of("mensaje", "Credenciales incorrectas"));
}

    // RECUPERAR CONTRASEÑA
    @PostMapping("/recuperar-password")
    public ResponseEntity<?> recuperarPassword(@RequestBody Map<String, String> request) {
        String correo = request.get("correo");

        if (correo == null || correo.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El correo es requerido."));
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correo);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("mensaje", "No se encontró un usuario con este correo."));
        }

        String codigo = String.valueOf((int) ((Math.random() * (999999 - 100000)) + 100000));
        String tokenJwt = jwtUtil.generarTokenRecuperacion(correo, codigo);

        try {
            emailService.enviarCodigoRecuperacion(correo, codigo);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "mensaje", "Error al enviar el correo. Revisa la configuración del servidor SMTP."
            ));
        }

        return ResponseEntity.ok(Map.of(
            "mensaje", "Código generado y enviado con éxito a tu correo.",
            "token", tokenJwt
        ));
    }

    // VERIFICAR JWT, CÓDIGO Y CAMBIAR CONTRASEÑA
    @PostMapping("/restablecer-password")
    public ResponseEntity<?> restablecerPassword(@RequestBody Map<String, String> request) {
        String tokenJwt = request.get("token");
        String codigoIngresado = request.get("codigo");
        String nuevaPassword = request.get("nuevaPassword");

        if (tokenJwt == null || codigoIngresado == null || nuevaPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Faltan parámetros requeridos."));
        }

        try {
            Claims claims = jwtUtil.obtenerClaims(tokenJwt);
            String correoToken = claims.getSubject();
            String codigoToken = claims.get("codigo", String.class);

            if (!codigoToken.equals(codigoIngresado)) {
                return ResponseEntity.status(400).body(Map.of("mensaje", "El código de verificación es incorrecto."));
            }

            Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correoToken);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("mensaje", "Usuario no encontrado."));
            }

            Usuario usuario = usuarioOpt.get();
            usuario.setPasswordHash(passwordEncoder.encode(nuevaPassword));
            usuarioRepository.save(usuario);

            return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada exitosamente."));

        } catch (ExpiredJwtException e) {
            return ResponseEntity.status(401).body(Map.of("mensaje", "El tiempo del código ha expirado. Solicita uno nuevo."));
        } catch (JwtException e) {
            return ResponseEntity.status(400).body(Map.of("mensaje", "Token de recuperación inválido o alterado."));
        }
    }
}