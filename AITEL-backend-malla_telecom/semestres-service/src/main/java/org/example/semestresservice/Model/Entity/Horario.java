package org.example.semestresservice.Model.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.example.semestresservice.Model.Curso;
import org.example.semestresservice.Model.Usuario;

import java.util.List;

@Entity
@Table(name = "horario")
public class Horario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @Column(nullable = false)
    private Semestre semestre;

    @Column(nullable = false)
    private Curso curso;

    @NotBlank(message = "El campo horario no debe estar vacío.")
    @Column(nullable = false, length = 10)
    private String horario;

    @OneToMany(cascade = CascadeType.ALL, fetch =  FetchType.LAZY)
    @JoinColumn(name = "id_horario", nullable = false)
    private List<HorarioAlumno> horarioAlumnos;

    @Transient
    private List<Usuario> alumnos;

    @OneToMany(cascade = CascadeType.ALL, fetch =  FetchType.LAZY)
    @JoinColumn(name = "id_horario", nullable = false)
    private List<HorarioProfesor> horarioProfesores;

    @Transient
    private List<Usuario> profesores;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Semestre getSemestre() {
        return semestre;
    }

    public void setSemestre(Semestre semestre) {
        this.semestre = semestre;
    }

    public Curso getCurso() {
        return curso;
    }

    public void setCurso(Curso curso) {
        this.curso = curso;
    }

    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    public List<HorarioAlumno> getHorarioAlumnos() {
        return horarioAlumnos;
    }

    public void setHorarioAlumnos(List<HorarioAlumno> horarioAlumnos) {
        this.horarioAlumnos = horarioAlumnos;
    }

    public List<Usuario> getAlumnos() {
        return alumnos;
    }

    public void setAlumnos(List<Usuario> alumnos) {
        this.alumnos = alumnos;
    }

    public List<HorarioProfesor> getHorarioProfesores() {
        return horarioProfesores;
    }

    public void setHorarioProfesores(List<HorarioProfesor> horarioProfesores) {
        this.horarioProfesores = horarioProfesores;
    }

    public List<Usuario> getProfesores() {
        return profesores;
    }

    public void setProfesores(List<Usuario> profesores) {
        this.profesores = profesores;
    }
}
