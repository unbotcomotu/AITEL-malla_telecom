package org.example.cursosservice.Model.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "curso")
public class Curso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_subcategoria")
    private Subcategoria subcategoria;

    @NotBlank(message = "El campo nombre no debe estar vacío.")
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotBlank(message = "El campo código no debe estar vacío.")
    @Column(nullable = false, length = 10)
    private String codigo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Min(0)
    @Max(10)
    @Column(nullable = false)
    private Long ciclo;

    @DecimalMin("0")
    @Column(nullable = false)
    private BigDecimal creditos;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private Boolean oculta = false;

    @Column(nullable = false)
    private Boolean congelada = false;

    @Min(0)
    @Column(name = "horas_teoria", nullable = false)
    private Integer horasTeoria = 0;

    @Min(0)
    @Column(name = "horas_practica", nullable = false)
    private Integer horasPractica = 0;

    @Min(0)
    @Column(name = "horas_laboratorio", nullable = false)
    private Integer horasLaboratorio = 0;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_curso")
    private List<CursoRequisito> cursoRequisitos;

    public Curso() {
        cursoRequisitos = new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Subcategoria getSubcategoria() {
        return subcategoria;
    }

    public void setSubcategoria(Subcategoria subcategoria) {
        this.subcategoria = subcategoria;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Long getCiclo() {
        return ciclo;
    }

    public void setCiclo(Long ciclo) {
        this.ciclo = ciclo;
    }

    public BigDecimal getCreditos() {
        return creditos;
    }

    public void setCreditos(BigDecimal creditos) {
        this.creditos = creditos;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Boolean getOculta() {
        return oculta;
    }

    public void setOculta(Boolean oculta) {
        this.oculta = oculta;
    }

    public Boolean getCongelada() {
        return congelada;
    }

    public void setCongelada(Boolean congelada) {
        this.congelada = congelada;
    }

    public Integer getHorasTeoria() {
        return horasTeoria;
    }

    public void setHorasTeoria(Integer horasTeoria) {
        this.horasTeoria = horasTeoria;
    }

    public Integer getHorasPractica() {
        return horasPractica;
    }

    public void setHorasPractica(Integer horasPractica) {
        this.horasPractica = horasPractica;
    }

    public Integer getHorasLaboratorio() {
        return horasLaboratorio;
    }

    public void setHorasLaboratorio(Integer horasLaboratorio) {
        this.horasLaboratorio = horasLaboratorio;
    }

    public List<CursoRequisito> getCursoRequisitos() {
        return cursoRequisitos;
    }

    public void setCursoRequisitos(List<CursoRequisito> cursoRequisitos) {
        this.cursoRequisitos = cursoRequisitos;
    }
}
