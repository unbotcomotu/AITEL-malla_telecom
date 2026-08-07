package org.example.usuariosservice.Controller;

import org.example.usuariosservice.Dto.UsuarioResponse;
import org.example.usuariosservice.Model.Roles;
import org.example.usuariosservice.Repository.UsuarioRepository;
import org.example.usuariosservice.Service.UsuarioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Endpoint de uso interno (via Feign) para que semestres-service, comentarios-service
 * y cursos-service (dashboard) resuelvan datos basicos de usuarios.
 */
@RestController
@RequestMapping("/usuarios")
public class UsuarioInternalController {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;

    public UsuarioInternalController(UsuarioService usuarioService, UsuarioRepository usuarioRepository) {
        this.usuarioService = usuarioService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/{id}")
    public UsuarioResponse getById(@PathVariable Long id) {
        return usuarioService.getById(id);
    }

    @GetMapping("/counts")
    public Map<String, Long> getCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("students", usuarioRepository.countByRol_RolAndEstadoTrue(Roles.ESTUDIANTE));
        counts.put("professors", usuarioRepository.countByRol_RolAndEstadoTrue(Roles.PROFESOR));
        return counts;
    }
}
