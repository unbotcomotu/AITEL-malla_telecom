package org.example.comentariosservice.Repository;

import org.example.comentariosservice.Model.Entity.ComentarioReaccion;
import org.example.comentariosservice.Model.TipoReaccion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComentarioReaccionRepository extends JpaRepository<ComentarioReaccion, Long> {
    Optional<ComentarioReaccion> findByIdComentarioAndIdUsuario(Long idComentario, Long idUsuario);

    List<ComentarioReaccion> findByIdComentarioIn(List<Long> idsComentario);

    long countByIdComentarioAndTipo(Long idComentario, TipoReaccion tipo);
}
