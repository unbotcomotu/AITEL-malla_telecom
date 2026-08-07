package org.example.cursosservice.Service;

import org.example.cursosservice.Dto.SubcategoriaRequest;
import org.example.cursosservice.Dto.SubcategoriaResponse;

import java.util.List;

public interface SubcategoriaService {
    List<SubcategoriaResponse> getByCategoria(Long categoriaId);

    SubcategoriaResponse create(Long categoriaId, SubcategoriaRequest request);

    SubcategoriaResponse update(Long id, SubcategoriaRequest request);

    void delete(Long id);

    SubcategoriaResponse toggleVisibility(Long id);
}
