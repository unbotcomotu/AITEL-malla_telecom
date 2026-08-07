package org.example.semestresservice.Repository;

import org.example.semestresservice.Model.Entity.Horario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HorarioRepository extends JpaRepository<Horario, Long> {
    List<Horario> findByIdCurso(Long idCurso);

    List<Horario> findByIdCursoAndSemestre_Semestre(Long idCurso, String semestre);
}
