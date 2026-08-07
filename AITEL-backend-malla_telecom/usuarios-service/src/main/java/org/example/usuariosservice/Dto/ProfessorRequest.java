package org.example.usuariosservice.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ProfessorRequest {

    @NotBlank(message = "Los nombres son requeridos.")
    private String nombres;

    @NotBlank(message = "Los apellidos son requeridos.")
    private String apellidos;

    @NotBlank(message = "El correo es requerido.")
    @Email(message = "Formato de correo invalido.")
    private String correo;

    @NotBlank(message = "El codigo es requerido.")
    private String codigo;

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }
}
