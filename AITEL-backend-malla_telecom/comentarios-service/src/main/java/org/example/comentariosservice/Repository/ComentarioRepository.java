package org.example.comentariosservice.Repository;

import org.example.comentariosservice.Model.Entity.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    List<Comentario> findByIdCursoAndCicloAcademicoOrderByFechaCreacionAsc(Long idCurso, String cicloAcademico);

    List<Comentario> findByIdCursoAndCicloAcademicoAndIdHorarioOrderByFechaCreacionAsc(Long idCurso, String cicloAcademico, Long idHorario);
}
