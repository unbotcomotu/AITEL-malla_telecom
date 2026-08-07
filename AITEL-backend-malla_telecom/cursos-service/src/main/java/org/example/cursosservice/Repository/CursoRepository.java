package org.example.cursosservice.Repository;

import org.example.cursosservice.Model.Entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CursoRepository extends JpaRepository<Curso, Long> {
    List<Curso> findBySubcategoria_Id(Long subcategoriaId);

    long countBySubcategoria_Id(Long subcategoriaId);
}
