package org.example.usuariosservice.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "El nombre es requerido.")
    private String firstName;

    @NotBlank(message = "El apellido es requerido.")
    private String lastName;

    @NotBlank(message = "El correo electronico es requerido.")
    @Email(message = "Formato de correo electronico invalido.")
    private String email;

    @NotBlank(message = "La contrasena es requerida.")
    @Size(min = 6, message = "La contrasena debe tener al menos 6 caracteres.")
    private String password;

    @NotBlank(message = "El codigo de estudiante es requerido.")
    private String studentCode;

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getStudentCode() {
        return studentCode;
    }

    public void setStudentCode(String studentCode) {
        this.studentCode = studentCode;
    }
}
