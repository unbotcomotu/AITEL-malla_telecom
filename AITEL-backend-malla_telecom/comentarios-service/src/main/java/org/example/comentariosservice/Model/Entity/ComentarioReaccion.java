package org.example.comentariosservice.Model.Entity;

import jakarta.persistence.*;
import org.example.comentariosservice.Model.TipoReaccion;

@Entity
@Table(name = "comentario_reaccion", uniqueConstraints = {
        @UniqueConstraint(name = "uk_reaccion_comentario_usuario", columnNames = {"id_comentario", "id_usuario"})
})
public class ComentarioReaccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @Column(name = "id_comentario", nullable = false)
    private Long idComentario;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TipoReaccion tipo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdComentario() {
        return idComentario;
    }

    public void setIdComentario(Long idComentario) {
        this.idComentario = idComentario;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public TipoReaccion getTipo() {
        return tipo;
    }

    public void setTipo(TipoReaccion tipo) {
        this.tipo = tipo;
    }
}
