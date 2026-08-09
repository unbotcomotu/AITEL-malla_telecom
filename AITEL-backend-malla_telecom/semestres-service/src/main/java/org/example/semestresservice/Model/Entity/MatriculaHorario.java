package org.example.semestresservice.Model.Entity;

import jakarta.persistence.*;

/**
 * Enlace opcional entre una matricula y una seccion concreta que el alumno
 * llevo. Es opcional a proposito: al registrar historial antiguo es muy
 * probable que ya no recuerde su horario, y aun asi debe poder registrar el
 * curso y participar en el foro. Si lo registra, sus comentarios y
 * valoraciones quedan vinculados a esa seccion y se pueden filtrar por ella.
 *
 * Un alumno puede enlazar hasta una seccion por tipo (clase, practica, examen).
 */
@Entity
@Table(name = "matricula_horario", uniqueConstraints = {
        @UniqueConstraint(name = "uk_matricula_horario",
                columnNames = {"id_matricula", "id_horario"})
})
public class MatriculaHorario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_matricula", nullable = false)
    private MatriculaAlumno matricula;

    @ManyToOne
    @JoinColumn(name = "id_horario", nullable = false)
    private Horario horario;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MatriculaAlumno getMatricula() {
        return matricula;
    }

    public void setMatricula(MatriculaAlumno matricula) {
        this.matricula = matricula;
    }

    public Horario getHorario() {
        return horario;
    }

    public void setHorario(Horario horario) {
        this.horario = horario;
    }
}
