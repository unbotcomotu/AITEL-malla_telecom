package org.example.cursosservice.Repository;

import org.example.cursosservice.Model.Entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CursoRepository extends JpaRepository<Curso, Long> {
}
