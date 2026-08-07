package org.example.cursosservice.Repository;

import org.example.cursosservice.Model.Entity.CursoRequisito;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CursoRequisitoRepository extends JpaRepository<CursoRequisito, Long> {
    boolean existsByIdCursoRequisito(Long idCursoRequisito);
}
