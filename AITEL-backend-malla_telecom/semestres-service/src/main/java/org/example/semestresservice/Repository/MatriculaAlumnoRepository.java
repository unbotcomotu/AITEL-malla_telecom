package org.example.semestresservice.Repository;

import org.example.semestresservice.Model.Entity.MatriculaAlumno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatriculaAlumnoRepository extends JpaRepository<MatriculaAlumno, Long> {
    List<MatriculaAlumno> findByIdAlumno(Long idAlumno);

    List<MatriculaAlumno> findByIdAlumnoAndAprobadoTrue(Long idAlumno);

    Optional<MatriculaAlumno> findByIdAlumnoAndIdCursoAndSemestre_Semestre(Long idAlumno, Long idCurso, String semestre);

    List<MatriculaAlumno> findByIdAlumnoAndSemestre_Semestre(Long idAlumno, String semestre);

    void deleteByIdAlumno(Long idAlumno);
}
