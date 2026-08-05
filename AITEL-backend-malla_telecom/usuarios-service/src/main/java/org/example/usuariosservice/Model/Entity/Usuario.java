package org.example.usuariosservice.Model.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    @NotBlank(message = "El campo nombres no debe estar vacío.")
    @Column(nullable = false, length = 45)
    private String nombres;

    @NotBlank(message = "El campo apellidos no debe estar vacío.")
    @Column(nullable = false, length = 45)
    private String apellidos;

    @NotBlank(message = "El campo correo no debe estar vacío.")
    @Email(message = "El campo correo debe tener formato de email.")
    @Column(nullable = false, length = 45)
    private String correo;

    @NotBlank(message = "El campo contraseña no debe estar vacío.")
    @Column(nullable = false, length = 2000)
    private String contrasenia;

    @NotBlank(message = "El campo código no debe estar vacío.")
    @Column(nullable = false, length = 45)
    private String codigo;

    @Column(nullable = false)
    private Boolean esPrimerLogeo;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private Boolean estado;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

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

    public String getContrasenia() {
        return contrasenia;
    }

    public void setContrasenia(String contrasenia) {
        this.contrasenia = contrasenia;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public Boolean getEsPrimerLogeo() {
        return esPrimerLogeo;
    }

    public void setEsPrimerLogeo(Boolean esPrimerLogeo) {
        this.esPrimerLogeo = esPrimerLogeo;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }
}
