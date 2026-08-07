package org.example.usuariosservice.Controller;

import jakarta.validation.Valid;
import org.example.usuariosservice.Dto.AuthResponse;
import org.example.usuariosservice.Dto.LoginRequest;
import org.example.usuariosservice.Dto.RegisterRequest;
import org.example.usuariosservice.Dto.UsuarioResponse;
import org.example.usuariosservice.Exception.ApiException;
import org.example.usuariosservice.Service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(usuarioService.login(request));
    }

    @GetMapping("/verify")
    public ResponseEntity<UsuarioResponse> verify(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "No autenticado.");
        }
        return ResponseEntity.ok(usuarioService.getById(userId));
    }
}
