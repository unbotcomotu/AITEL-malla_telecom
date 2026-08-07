package org.example.cursosservice.Controller;

import org.example.cursosservice.Dto.CategoriaResponse;
import org.example.cursosservice.Dto.CursoResponse;
import org.example.cursosservice.Service.CategoriaService;
import org.example.cursosservice.Service.CursoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/catalog")
public class CatalogoController {

    private final CursoService cursoService;
    private final CategoriaService categoriaService;

    public CatalogoController(CursoService cursoService, CategoriaService categoriaService) {
        this.cursoService = cursoService;
        this.categoriaService = categoriaService;
    }

    @GetMapping("/courses")
    public List<CursoResponse> getAllCourses() {
        return cursoService.getAllForCatalog();
    }

    @GetMapping("/categories")
    public List<CategoriaResponse> getCategories() {
        return categoriaService.getAll();
    }
}
