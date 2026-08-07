package org.example.usuariosservice.Service;

import org.example.usuariosservice.Dto.AuthResponse;
import org.example.usuariosservice.Dto.LoginRequest;
import org.example.usuariosservice.Dto.ProfessorRequest;
import org.example.usuariosservice.Dto.RegisterRequest;
import org.example.usuariosservice.Dto.UsuarioResponse;
import org.example.usuariosservice.Exception.ApiException;
import org.example.usuariosservice.Model.Entity.Rol;
import org.example.usuariosservice.Model.Entity.Usuario;
import org.example.usuariosservice.Model.Roles;
import org.example.usuariosservice.Repository.RolRepository;
import org.example.usuariosservice.Repository.UsuarioRepository;
import org.example.usuariosservice.Security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository,
                               RolRepository rolRepository,
                               PasswordEncoder passwordEncoder,
                               JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByCorreo(request.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo.");
        }

        Rol rolEstudiante = rolRepository.findByRol(Roles.ESTUDIANTE)
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Rol ESTUDIANTE no configurado."));

        Usuario usuario = new Usuario();
        usuario.setRol(rolEstudiante);
        usuario.setNombres(request.getFirstName());
        usuario.setApellidos(request.getLastName());
        usuario.setCorreo(request.getEmail());
        usuario.setContrasenia(passwordEncoder.encode(request.getPassword()));
        usuario.setCodigo(request.getStudentCode());
        usuario.setEsPrimerLogeo(true);
        usuario.setFechaCreacion(LocalDateTime.now());
        usuario.setEstado(true);

        usuario = usuarioRepository.save(usuario);

        String token = jwtService.generarToken(usuario);
        return new AuthResponse(token, UsuarioResponse.from(usuario));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Correo o contrasena incorrectos."));

        if (!Boolean.TRUE.equals(usuario.getEstado())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "La cuenta esta deshabilitada.");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getContrasenia())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Correo o contrasena incorrectos.");
        }

        String token = jwtService.generarToken(usuario);
        return new AuthResponse(token, UsuarioResponse.from(usuario));
    }

    @Override
    public UsuarioResponse getById(Long id) {
        return UsuarioResponse.from(buscarUsuario(id));
    }

    @Override
    public List<UsuarioResponse> getProfessors() {
        return usuarioRepository.findByRol_Rol(Roles.PROFESOR).stream()
                .map(UsuarioResponse::from)
                .toList();
    }

    @Override
    public UsuarioResponse getProfessorById(Long id) {
        return UsuarioResponse.from(buscarUsuario(id));
    }

    @Override
    @Transactional
    public UsuarioResponse createProfessor(ProfessorRequest request) {
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new ApiException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo.");
        }

        Rol rolProfesor = rolRepository.findByRol(Roles.PROFESOR)
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Rol PROFESOR no configurado."));

        Usuario usuario = new Usuario();
        usuario.setRol(rolProfesor);
        usuario.setNombres(request.getNombres());
        usuario.setApellidos(request.getApellidos());
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasenia(passwordEncoder.encode(request.getCodigo() + "-temporal"));
        usuario.setCodigo(request.getCodigo());
        usuario.setEsPrimerLogeo(true);
        usuario.setFechaCreacion(LocalDateTime.now());
        usuario.setEstado(true);

        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional
    public UsuarioResponse updateProfessor(Long id, ProfessorRequest request) {
        Usuario usuario = buscarUsuario(id);
        usuario.setNombres(request.getNombres());
        usuario.setApellidos(request.getApellidos());
        usuario.setCorreo(request.getCorreo());
        usuario.setCodigo(request.getCodigo());
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional
    public void deleteProfessor(Long id) {
        Usuario usuario = buscarUsuario(id);
        usuario.setEstado(false);
        usuarioRepository.save(usuario);
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));
    }
}
