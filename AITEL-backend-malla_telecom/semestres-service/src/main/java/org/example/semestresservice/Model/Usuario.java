package org.example.semestresservice.Model;

/**
 * DTO que refleja la forma real del JSON que expone usuarios-service
 * (UsuarioResponse). Se llena via Feign, nunca se persiste.
 */
public class Usuario {
    private Long id;
    private String email;
    private String fullName;
    private String studentCode;
    private String role;
    private boolean isFirstLogin;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getStudentCode() {
        return studentCode;
    }

    public void setStudentCode(String studentCode) {
        this.studentCode = studentCode;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isFirstLogin() {
        return isFirstLogin;
    }

    public void setIsFirstLogin(boolean firstLogin) {
        isFirstLogin = firstLogin;
    }
}
