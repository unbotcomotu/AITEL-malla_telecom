package org.example.usuariosservice.Repository;

import org.example.usuariosservice.Model.Entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
}
