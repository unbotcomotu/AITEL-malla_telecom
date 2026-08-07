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

    @ManyToOne
    @JoinColumn(name = "id_horario", nullable = false)
    private Horario horario;

    @Column(name = "id_alumno", nullable = false)
    private Long idAlumno;

    @Max(20)
    @Min(0)
    @Column(name = "nota_final")
    private Long notaFinal;

    @Column(nullable = false)
    private Boolean tieneExcepcion = false;

    @Column(nullable = false)
    private Boolean aprobado = false;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Horario getHorario() {
        return horario;
    }

    public void setHorario(Horario horario) {
        this.horario = horario;
    }

    public Long getIdAlumno() {
        return idAlumno;
    }

    public void setIdAlumno(Long idAlumno) {
        this.idAlumno = idAlumno;
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
