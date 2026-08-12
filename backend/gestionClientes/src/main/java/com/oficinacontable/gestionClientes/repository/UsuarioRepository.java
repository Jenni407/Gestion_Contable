package com.oficinacontable.gestionClientes.repository;

import com.oficinacontable.gestionClientes.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCorreo(String correo);
    
    // Método para permitir login por correo o por nombre
    Optional<Usuario> findByCorreoOrNombre(String correo, String nombre);
    
    // Método para buscar usuario por código de recuperación
    Optional<Usuario> findByCodigoRecuperacion(String codigoRecuperacion);
}