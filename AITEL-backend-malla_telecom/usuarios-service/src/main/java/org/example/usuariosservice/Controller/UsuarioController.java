package org.example.usuariosservice.Controller;

import jakarta.validation.Valid;
import org.example.usuariosservice.Dto.ProfessorRequest;
import org.example.usuariosservice.Dto.UsuarioResponse;
import org.example.usuariosservice.Service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/professors")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> getAllProfessors() {
        return ResponseEntity.ok(usuarioService.getProfessors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> getProfessorById(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.getProfessorById(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> createProfessor(@Valid @RequestBody ProfessorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.createProfessor(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> updateProfessor(@PathVariable Long id, @Valid @RequestBody ProfessorRequest request) {
        return ResponseEntity.ok(usuarioService.updateProfessor(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfessor(@PathVariable Long id) {
        usuarioService.deleteProfessor(id);
        return ResponseEntity.noContent().build();
    }
}
