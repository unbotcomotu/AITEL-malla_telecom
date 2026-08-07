package org.example.usuariosservice.Repository;

import org.example.usuariosservice.Model.Entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCorreo(String correo);
    boolean existsByCorreo(String correo);
    List<Usuario> findByRol_Rol(String rol);
    long countByRol_RolAndEstadoTrue(String rol);
}
