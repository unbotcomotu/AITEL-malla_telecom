package org.example.semestresservice.Model.Entity;

import jakarta.persistence.*;

/**
 * Registra que un alumno "vivio" un semestre (periodo academico), haya o no
 * llevado cursos en el — necesario para semestres suspendidos, que de otro
 * modo no dejan ningun rastro (HorarioAlumno solo existe si hay matricula).
 */
@Entity
@Table(name = "alumno_semestre", uniqueConstraints = @UniqueConstraint(columnNames = {"id_alumno", "id_semestre"}))
public class AlumnoSemestre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @Column(name = "id_alumno", nullable = false)
    private Long idAlumno;

    @ManyToOne
    @JoinColumn(name = "id_semestre", nullable = false)
    private Semestre semestre;

    @Column(nullable = false)
    private Boolean suspendido = false;

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

    public Semestre getSemestre() {
        return semestre;
    }

    public void setSemestre(Semestre semestre) {
        this.semestre = semestre;
    }

    public Boolean getSuspendido() {
        return suspendido;
    }

    public void setSuspendido(Boolean suspendido) {
        this.suspendido = suspendido;
    }
}
