package org.example.cursosservice.Service;

import org.example.cursosservice.Dto.CategoriaRequest;
import org.example.cursosservice.Dto.CategoriaResponse;

import java.util.List;

public interface CategoriaService {
    List<CategoriaResponse> getAll();

    CategoriaResponse create(CategoriaRequest request);

    CategoriaResponse update(Long id, CategoriaRequest request);

    void delete(Long id);

    CategoriaResponse toggleHidden(Long id);
}
