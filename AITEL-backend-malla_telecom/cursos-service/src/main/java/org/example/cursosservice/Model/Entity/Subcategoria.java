package org.example.cursosservice.Model.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "subcategoria")
public class Subcategoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    @NotBlank(message = "El campo subcategoría no debe estar vacío.")
    @Column(nullable = false, length = 100)
    private String subcategoria;

    @Column(nullable = false)
    private Boolean oculta = false;

    @Column(nullable = false)
    private Boolean congelada = false;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 20)
    private String color;

    private Integer ciclo;

    @Column(name = "cursos_requeridos")
    private Integer cursosRequeridos;

    @Column(name = "requiere_todos", nullable = false)
    private Boolean requiereTodos = false;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public String getSubcategoria() {
        return subcategoria;
    }

    public void setSubcategoria(String subcategoria) {
        this.subcategoria = subcategoria;
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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getCiclo() {
        return ciclo;
    }

    public void setCiclo(Integer ciclo) {
        this.ciclo = ciclo;
    }

    public Integer getCursosRequeridos() {
        return cursosRequeridos;
    }

    public void setCursosRequeridos(Integer cursosRequeridos) {
        this.cursosRequeridos = cursosRequeridos;
    }

    public Boolean getRequiereTodos() {
        return requiereTodos;
    }

    public void setRequiereTodos(Boolean requiereTodos) {
        this.requiereTodos = requiereTodos;
    }
}
