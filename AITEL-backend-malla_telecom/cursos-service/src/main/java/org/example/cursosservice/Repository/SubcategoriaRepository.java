package org.example.cursosservice.Repository;

import org.example.cursosservice.Model.Entity.Subcategoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubcategoriaRepository extends JpaRepository<Subcategoria, Long> {
    List<Subcategoria> findByCategoria_Id(Long categoriaId);
}
