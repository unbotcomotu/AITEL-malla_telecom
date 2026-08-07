package org.example.usuariosservice.Model;

public final class Roles {
    // Valores en minuscula a proposito: el front (App.jsx DashboardRedirect)
    // compara user.role === 'admin' literalmente.
    public static final String ESTUDIANTE = "student";
    public static final String PROFESOR = "professor";
    public static final String ADMIN = "admin";

    private Roles() {
    }
}
