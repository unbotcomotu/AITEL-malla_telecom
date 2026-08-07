package org.example.semestresservice.Service;

import org.example.semestresservice.Dto.SemestreResponse;

import java.util.List;
import java.util.Optional;

public interface SemestreService {
    List<SemestreResponse> getAll();

    SemestreResponse create(String nombre);

    SemestreResponse activate(Long id);

    Optional<SemestreResponse> getActivo();
}
