package org.example.usuariosservice.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.example.usuariosservice.Model.Entity.Usuario;

public class UsuarioResponse {

    private Long id;
    private String email;
    private String fullName;
    private String studentCode;
    private String role;
    private boolean isFirstLogin;

    public static UsuarioResponse from(Usuario usuario) {
        UsuarioResponse response = new UsuarioResponse();
        response.id = usuario.getId();
        response.email = usuario.getCorreo();
        response.fullName = usuario.getNombres() + " " + usuario.getApellidos();
        response.studentCode = usuario.getCodigo();
        response.role = usuario.getRol().getRol();
        response.isFirstLogin = Boolean.TRUE.equals(usuario.getEsPrimerLogeo());
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getStudentCode() {
        return studentCode;
    }

    public String getRole() {
        return role;
    }

    @JsonProperty("isFirstLogin")
    public boolean isFirstLogin() {
        return isFirstLogin;
    }
}
