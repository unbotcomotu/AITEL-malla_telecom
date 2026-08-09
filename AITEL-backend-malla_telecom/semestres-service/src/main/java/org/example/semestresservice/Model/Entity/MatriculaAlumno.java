package org.example.semestresservice.Model.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.ArrayList;
import java.util.List;

/**
 * Un curso que el alumno llevo en un semestre, con su nota.
 *
 * Reemplaza al antiguo HorarioAlumno, que colgaba la nota de un Horario
 * concreto: eso obligaba a inventar una seccion ficticia ("HIST") para poder
 * registrar historial antiguo, y dejaba al alumno atribuido a una seccion que
 * quizas nunca llevo. Aqui la nota vive en (alumno, curso, semestre) y las
 * secciones son enlaces opcionales encima (ver MatriculaHorario).
 */
@Entity
@Table(name = "matricula_alumno", uniqueConstraints = {
        @UniqueConstraint(name = "uk_matricula_alumno_curso_semestre",
                columnNames = {"id_alumno", "id_curso", "id_semestre"})
})
public class MatriculaAlumno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @Column(name = "id_alumno", nullable = false)
    private Long idAlumno;

    @Column(name = "id_curso", nullable = false)
    private Long idCurso;

    @ManyToOne
    @JoinColumn(name = "id_semestre", nullable = false)
    private Semestre semestre;

    @Max(20)
    @Min(0)
    @Column(name = "nota_final")
    private Long notaFinal;

    @Column(name = "tiene_excepcion", nullable = false)
    private Boolean tieneExcepcion = false;

    @Column(nullable = false)
    private Boolean aprobado = false;

    @OneToMany(mappedBy = "matricula", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<MatriculaHorario> horarios = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdAlumno() {
        return idAlumno;
    }

    public void setIdAlumno(Long idAlumno) {
        this.idAlumno = idAlumno;
    }

    public Long getIdCurso() {
        return idCurso;
    }

    public void setIdCurso(Long idCurso) {
        this.idCurso = idCurso;
    }

    public Semestre getSemestre() {
        return semestre;
    }

    public void setSemestre(Semestre semestre) {
        this.semestre = semestre;
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

    public List<MatriculaHorario> getHorarios() {
        return horarios;
    }

    public void setHorarios(List<MatriculaHorario> horarios) {
        this.horarios = horarios;
    }
}
