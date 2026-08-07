package org.example.cursosservice.Repository;

import org.example.cursosservice.Model.Entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}
