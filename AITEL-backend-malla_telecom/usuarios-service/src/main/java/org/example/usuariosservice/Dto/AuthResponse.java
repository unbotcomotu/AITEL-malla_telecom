package org.example.usuariosservice.Dto;

public class AuthResponse {

    private String token;
    private UsuarioResponse user;

    public AuthResponse(String token, UsuarioResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public UsuarioResponse getUser() {
        return user;
    }
}
