package org.example.cursosservice.Service;

import org.example.cursosservice.Dto.CategoriaRequest;
import org.example.cursosservice.Dto.CategoriaResponse;
import org.example.cursosservice.Dto.SubcategoriaResponse;
import org.example.cursosservice.Exception.ApiException;
import org.example.cursosservice.Model.Entity.Categoria;
import org.example.cursosservice.Repository.CategoriaRepository;
import org.example.cursosservice.Repository.SubcategoriaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final SubcategoriaRepository subcategoriaRepository;

    public CategoriaServiceImpl(CategoriaRepository categoriaRepository, SubcategoriaRepository subcategoriaRepository) {
        this.categoriaRepository = categoriaRepository;
        this.subcategoriaRepository = subcategoriaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaResponse> getAll() {
        return categoriaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CategoriaResponse create(CategoriaRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El nombre de la categoria es requerido.");
        }
        Categoria categoria = new Categoria();
        categoria.setCategoria(request.getName());
        categoria.setDescripcion(request.getDescription());
        categoria.setColor(request.getColor());
        if (request.getCycleAssociation() != null) {
            categoria.setAsociacionCiclo(request.getCycleAssociation());
        }
        categoria.setOculta(Boolean.TRUE.equals(request.getIsHidden()));
        categoria.setCongelada(Boolean.TRUE.equals(request.getIsFrozen()));
        return toResponse(categoriaRepository.save(categoria));
    }

    @Override
    @Transactional
    public CategoriaResponse update(Long id, CategoriaRequest request) {
        Categoria categoria = buscar(id);
        if (request.getName() != null) {
            categoria.setCategoria(request.getName());
        }
        if (request.getDescription() != null) {
            categoria.setDescripcion(request.getDescription());
        }
        if (request.getColor() != null) {
            categoria.setColor(request.getColor());
        }
        if (request.getCycleAssociation() != null) {
            categoria.setAsociacionCiclo(request.getCycleAssociation());
        }
        if (request.getIsFrozen() != null) {
            categoria.setCongelada(request.getIsFrozen());
        }
        if (request.getIsHidden() != null) {
            categoria.setOculta(request.getIsHidden());
        }
        return toResponse(categoriaRepository.save(categoria));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Categoria categoria = buscar(id);
        if (!subcategoriaRepository.findByCategoria_Id(id).isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "No se puede eliminar: la categoria tiene subcategorias asociadas.");
        }
        categoriaRepository.delete(categoria);
    }

    @Override
    @Transactional
    public CategoriaResponse toggleHidden(Long id) {
        Categoria categoria = buscar(id);
        categoria.setOculta(!Boolean.TRUE.equals(categoria.getOculta()));
        return toResponse(categoriaRepository.save(categoria));
    }

    private Categoria buscar(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Categoria no encontrada."));
    }

    private CategoriaResponse toResponse(Categoria categoria) {
        List<SubcategoriaResponse> subcategorias = subcategoriaRepository.findByCategoria_Id(categoria.getId()).stream()
                .map(SubcategoriaResponse::from)
                .toList();
        return CategoriaResponse.from(categoria, subcategorias);
    }
}
