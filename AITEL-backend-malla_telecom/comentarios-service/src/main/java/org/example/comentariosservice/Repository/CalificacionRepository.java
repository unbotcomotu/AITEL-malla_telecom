package org.example.comentariosservice.Repository;

import org.example.comentariosservice.Model.Entity.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {

    @Query("SELECT c FROM Calificacion c WHERE c.idCurso = :idCurso AND c.cicloAcademico = :cicloAcademico "
            + "AND (:idHorario IS NULL AND c.idHorario IS NULL OR c.idHorario = :idHorario) "
            + "AND c.idUsuario = :idUsuario")
    Optional<Calificacion> findExistente(@Param("idCurso") Long idCurso,
                                          @Param("cicloAcademico") String cicloAcademico,
                                          @Param("idHorario") Long idHorario,
                                          @Param("idUsuario") Long idUsuario);

    List<Calificacion> findByIdCursoAndCicloAcademico(Long idCurso, String cicloAcademico);

    List<Calificacion> findByIdCurso(Long idCurso);
}
