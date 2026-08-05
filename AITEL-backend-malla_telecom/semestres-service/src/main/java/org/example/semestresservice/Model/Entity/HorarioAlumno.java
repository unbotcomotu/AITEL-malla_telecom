package org.example.semestresservice.Model.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@Entity
@Table(name = "alumnos_por_horario")
public class HorarioAlumno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @Column(nullable = false)
    private Long id_alumno;

    @Column(nullable = false)
    @Max(20)
    @Min(0)
    private Long notaFinal;

    @Column(nullable = false)
    private Boolean tieneExcepcion;

    @Column(nullable = false)
    private Boolean aprobado;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId_alumno() {
        return id_alumno;
    }

    public void setId_alumno(Long id_alumno) {
        this.id_alumno = id_alumno;
    }

    public Long getNotaFinal() {
        return notaFinal;
    }

    public void setNotaFinal(Long notaFinal) {
        this.notaFinal = notaFinal;
    }

    public Boolean getTieneExcepcion() {
        return tieneExcepcion;
    }

    public void setTieneExcepcion(Boolean tieneExcepcion) {
        this.tieneExcepcion = tieneExcepcion;
    }

    public Boolean getAprobado() {
        return aprobado;
    }

    public void setAprobado(Boolean aprobado) {
        this.aprobado = aprobado;
    }
}
