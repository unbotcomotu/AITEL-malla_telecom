package org.example.semestresservice.Repository;

import org.example.semestresservice.Model.Entity.HorarioAlumno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HorarioAlumnoRepository extends JpaRepository<HorarioAlumno, Long> {
    List<HorarioAlumno> findByIdAlumno(Long idAlumno);

    Optional<HorarioAlumno> findByHorario_IdAndIdAlumno(Long idHorario, Long idAlumno);

    List<HorarioAlumno> findByIdAlumnoAndAprobadoTrue(Long idAlumno);

    void deleteByIdAlumno(Long idAlumno);
}
