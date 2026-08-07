package org.example.cursosservice.Service;

import org.example.cursosservice.Dto.SubcategoriaRequest;
import org.example.cursosservice.Dto.SubcategoriaResponse;
import org.example.cursosservice.Exception.ApiException;
import org.example.cursosservice.Model.Entity.Categoria;
import org.example.cursosservice.Model.Entity.Subcategoria;
import org.example.cursosservice.Repository.CategoriaRepository;
import org.example.cursosservice.Repository.CursoRepository;
import org.example.cursosservice.Repository.SubcategoriaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubcategoriaServiceImpl implements SubcategoriaService {

    private final SubcategoriaRepository subcategoriaRepository;
    private final CategoriaRepository categoriaRepository;
    private final CursoRepository cursoRepository;

    public SubcategoriaServiceImpl(SubcategoriaRepository subcategoriaRepository,
                                    CategoriaRepository categoriaRepository,
                                    CursoRepository cursoRepository) {
        this.subcategoriaRepository = subcategoriaRepository;
        this.categoriaRepository = categoriaRepository;
        this.cursoRepository = cursoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubcategoriaResponse> getByCategoria(Long categoriaId) {
        return subcategoriaRepository.findByCategoria_Id(categoriaId).stream()
                .map(SubcategoriaResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public SubcategoriaResponse create(Long categoriaId, SubcategoriaRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El nombre de la subcategoria es requerido.");
        }
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Categoria no encontrada."));

        Subcategoria subcategoria = new Subcategoria();
        subcategoria.setCategoria(categoria);
        subcategoria.setSubcategoria(request.getName());
        subcategoria.setDescripcion(request.getDescription());
        subcategoria.setColor(request.getColor());
        subcategoria.setCiclo(request.getCycle());
        subcategoria.setCursosRequeridos(request.getRequiredCourses());
        subcategoria.setRequiereTodos(Boolean.TRUE.equals(request.getRequiresAll()));
        subcategoria.setOculta(Boolean.TRUE.equals(request.getIsHidden()));
        subcategoria.setCongelada(Boolean.TRUE.equals(request.getIsFrozen()));
        return SubcategoriaResponse.from(subcategoriaRepository.save(subcategoria));
    }

    @Override
    @Transactional
    public SubcategoriaResponse update(Long id, SubcategoriaRequest request) {
        Subcategoria subcategoria = buscar(id);
        if (request.getName() != null) {
            subcategoria.setSubcategoria(request.getName());
        }
        if (request.getDescription() != null) {
            subcategoria.setDescripcion(request.getDescription());
        }
        if (request.getColor() != null) {
            subcategoria.setColor(request.getColor());
        }
        if (request.getCycle() != null) {
            subcategoria.setCiclo(request.getCycle());
        }
        if (request.getRequiredCourses() != null) {
            subcategoria.setCursosRequeridos(request.getRequiredCourses());
        }
        if (request.getRequiresAll() != null) {
            subcategoria.setRequiereTodos(request.getRequiresAll());
        }
        if (request.getIsFrozen() != null) {
            subcategoria.setCongelada(request.getIsFrozen());
        }
        if (request.getIsHidden() != null) {
            subcategoria.setOculta(request.getIsHidden());
        }
        return SubcategoriaResponse.from(subcategoriaRepository.save(subcategoria));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Subcategoria subcategoria = buscar(id);
        if (!cursoRepository.findBySubcategoria_Id(id).isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "No se puede eliminar: la subcategoria tiene cursos asociados.");
        }
        subcategoriaRepository.delete(subcategoria);
    }

    @Override
    @Transactional
    public SubcategoriaResponse toggleVisibility(Long id) {
        Subcategoria subcategoria = buscar(id);
        subcategoria.setOculta(!Boolean.TRUE.equals(subcategoria.getOculta()));
        return SubcategoriaResponse.from(subcategoriaRepository.save(subcategoria));
    }

    private Subcategoria buscar(Long id) {
        return subcategoriaRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Subcategoria no encontrada."));
    }
}
