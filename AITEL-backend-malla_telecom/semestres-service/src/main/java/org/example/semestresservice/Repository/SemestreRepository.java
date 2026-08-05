package org.example.semestresservice.Repository;

import org.example.semestresservice.Model.Entity.Semestre;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SemestreRepository extends JpaRepository<Semestre,Integer> {
}
