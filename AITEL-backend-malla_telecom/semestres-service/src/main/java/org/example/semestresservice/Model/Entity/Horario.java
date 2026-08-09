package org.example.semestresservice.Model.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.example.semestresservice.Model.Curso;
import org.example.semestresservice.Model.TipoHorario;
import org.example.semestresservice.Model.Usuario;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "horario")
public class Horario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_semestre", nullable = false)
    private Semestre semestre;

    @Column(name = "id_curso", nullable = false)
    private Long idCurso;

    @Transient
    private Curso curso;

    @NotBlank(message = "El campo horario no debe estar vacío.")
    @Column(nullable = false, length = 10)
    private String horario;

    // Clase / Practica / Examen. Un curso tiene una seccion por cada tipo y el
    // alumno se enlaza a las que llevo (ver AlumnoHorario).
    // columnDefinition con DEFAULT para que, al agregar la columna sobre una
    // tabla que ya tiene secciones, MySQL las rellene como CLASE en vez de
    // dejarlas en blanco (un valor vacio no mapea al enum y romperia la lectura).
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "VARCHAR(20) NOT NULL DEFAULT 'CLASE'")
    private TipoHorario tipo = TipoHorario.CLASE;

    // Columna "Hor. Aso" del campus: codigo de la seccion de clase a la que
    // esta atada esta seccion. Solo algunos cursos la usan; cuando viene vacia,
    // el alumno puede combinar cualquier laboratorio con cualquier clase.
    @Column(name = "horario_asociado", length = 10)
    private String horarioAsociado;

    @OneToMany(mappedBy = "horario", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<BloqueHorario> bloques = new ArrayList<>();

    @OneToMany(mappedBy = "horario", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<MatriculaHorario> matriculas = new ArrayList<>();

    @Transient
    private List<Usuario> alumnos;

    @OneToMany(mappedBy = "horario", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<HorarioProfesor> horarioProfesores = new ArrayList<>();

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

    public Long getIdCurso() {
        return idCurso;
    }

    public void setIdCurso(Long idCurso) {
        this.idCurso = idCurso;
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

    public TipoHorario getTipo() {
        return tipo;
    }

    public void setTipo(TipoHorario tipo) {
        this.tipo = tipo;
    }

    public String getHorarioAsociado() {
        return horarioAsociado;
    }

    public void setHorarioAsociado(String horarioAsociado) {
        this.horarioAsociado = horarioAsociado;
    }

    public List<BloqueHorario> getBloques() {
        return bloques;
    }

    public void setBloques(List<BloqueHorario> bloques) {
        this.bloques = bloques;
    }

    public List<MatriculaHorario> getMatriculas() {
        return matriculas;
    }

    public void setMatriculas(List<MatriculaHorario> matriculas) {
        this.matriculas = matriculas;
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
