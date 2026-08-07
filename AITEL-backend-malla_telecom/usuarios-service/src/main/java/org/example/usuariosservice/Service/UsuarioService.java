package org.example.usuariosservice.Service;

import org.example.usuariosservice.Dto.AuthResponse;
import org.example.usuariosservice.Dto.LoginRequest;
import org.example.usuariosservice.Dto.ProfessorRequest;
import org.example.usuariosservice.Dto.RegisterRequest;
import org.example.usuariosservice.Dto.UsuarioResponse;

import java.util.List;

public interface UsuarioService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UsuarioResponse getById(Long id);

    List<UsuarioResponse> getProfessors();

    UsuarioResponse getProfessorById(Long id);

    UsuarioResponse createProfessor(ProfessorRequest request);

    UsuarioResponse updateProfessor(Long id, ProfessorRequest request);

    void deleteProfessor(Long id);
}
