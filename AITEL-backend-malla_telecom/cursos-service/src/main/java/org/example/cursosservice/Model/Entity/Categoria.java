package org.example.cursosservice.Model.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "categoria")
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @NotBlank(message = "El campo categoría no debe estar vacío.")
    @Column(nullable = false, length = 100)
    private String categoria;

    @Column(nullable = false)
    private Boolean oculta = false;

    @Column(nullable = false)
    private Boolean congelada = false;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 20)
    private String color;

    @Column(name = "asociacion_ciclo", nullable = false)
    private Boolean asociacionCiclo = true;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
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

    public Boolean getAsociacionCiclo() {
        return asociacionCiclo;
    }

    public void setAsociacionCiclo(Boolean asociacionCiclo) {
        this.asociacionCiclo = asociacionCiclo;
    }
}
