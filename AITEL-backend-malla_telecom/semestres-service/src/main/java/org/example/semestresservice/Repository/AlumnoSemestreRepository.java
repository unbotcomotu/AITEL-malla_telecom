package org.example.semestresservice.Repository;

import org.example.semestresservice.Model.Entity.AlumnoSemestre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlumnoSemestreRepository extends JpaRepository<AlumnoSemestre, Long> {
    List<AlumnoSemestre> findByIdAlumno(Long idAlumno);

    Optional<AlumnoSemestre> findByIdAlumnoAndSemestre_Id(Long idAlumno, Long idSemestre);

    void deleteByIdAlumno(Long idAlumno);
}
