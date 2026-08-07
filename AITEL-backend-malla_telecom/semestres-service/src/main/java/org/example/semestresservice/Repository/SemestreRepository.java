package org.example.semestresservice.Repository;

import org.example.semestresservice.Model.Entity.Semestre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SemestreRepository extends JpaRepository<Semestre, Long> {
    Optional<Semestre> findByActivoTrue();

    Optional<Semestre> findBySemestre(String semestre);
}
