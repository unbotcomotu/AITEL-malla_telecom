package org.example.comentariosservice.Model.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.time.LocalDateTime;

/**
 * Que tan dificil le parecio el curso al alumno, del 1 al 5.
 *
 * Va en su propia tabla y no como una columna mas de Calificacion a proposito:
 * son dos juicios distintos (un curso puede ser excelente y durisimo a la vez)
 * y se quiere poder opinar de uno sin opinar del otro.
 *
 * Igual que la calificacion, puede ser general del curso (id_horario nulo) o
 * especifica de una seccion, si el alumno registro su horario.
 */
@Entity
@Table(name = "dificultad", uniqueConstraints = {
        @UniqueConstraint(name = "uk_dificultad_oferta_usuario",
                columnNames = {"id_curso", "ciclo_academico", "id_horario", "id_usuario"})
})
public class Dificultad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @Column(name = "id_curso", nullable = false)
    private Long idCurso;

    @Column(name = "ciclo_academico", nullable = false, length = 20)
    private String cicloAcademico;

    @Column(name = "id_horario")
    private Long idHorario;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private Integer puntuacion;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdCurso() {
        return idCurso;
    }

    public void setIdCurso(Long idCurso) {
        this.idCurso = idCurso;
    }

    public String getCicloAcademico() {
        return cicloAcademico;
    }

    public void setCicloAcademico(String cicloAcademico) {
        this.cicloAcademico = cicloAcademico;
    }

    public Long getIdHorario() {
        return idHorario;
    }

    public void setIdHorario(Long idHorario) {
        this.idHorario = idHorario;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Integer getPuntuacion() {
        return puntuacion;
    }

    public void setPuntuacion(Integer puntuacion) {
        this.puntuacion = puntuacion;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
