package org.example.comentariosservice.Repository;

import org.example.comentariosservice.Model.Entity.Dificultad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DificultadRepository extends JpaRepository<Dificultad, Long> {

    @Query("SELECT d FROM Dificultad d WHERE d.idCurso = :idCurso AND d.cicloAcademico = :cicloAcademico "
            + "AND (:idHorario IS NULL AND d.idHorario IS NULL OR d.idHorario = :idHorario) "
            + "AND d.idUsuario = :idUsuario")
    Optional<Dificultad> findExistente(@Param("idCurso") Long idCurso,
                                        @Param("cicloAcademico") String cicloAcademico,
                                        @Param("idHorario") Long idHorario,
                                        @Param("idUsuario") Long idUsuario);

    List<Dificultad> findByIdCurso(Long idCurso);

    List<Dificultad> findByIdCursoAndCicloAcademico(Long idCurso, String cicloAcademico);

    List<Dificultad> findByIdCursoAndIdHorario(Long idCurso, Long idHorario);

    /** Para el filtro por ultimos N semestres: el llamador arma la lista de ciclos. */
    List<Dificultad> findByIdCursoAndCicloAcademicoIn(Long idCurso, List<String> ciclos);
}
