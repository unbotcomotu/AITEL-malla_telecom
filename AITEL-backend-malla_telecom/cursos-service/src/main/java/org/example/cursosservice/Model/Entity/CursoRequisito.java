package org.example.cursosservice.Model.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "requisito_por_curso")
public class CursoRequisito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @Column(name = "id_curso_requisito", nullable = false)
    private Long idCursoRequisito;

    @NotBlank(message = "El campo condicion no debe estar vacío.")
    @Column(length = 50, nullable = false)
    private String condicion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdCursoRequisito() {
        return idCursoRequisito;
    }

    public void setIdCursoRequisito(Long idCursoRequisito) {
        this.idCursoRequisito = idCursoRequisito;
    }

    public String getCondicion() {
        return condicion;
    }

    public void setCondicion(String condicion) {
        this.condicion = condicion;
    }
}
