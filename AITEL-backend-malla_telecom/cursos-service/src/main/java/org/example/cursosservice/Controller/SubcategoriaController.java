package org.example.cursosservice.Controller;

import org.example.cursosservice.Dto.CursoRequest;
import org.example.cursosservice.Dto.CursoResponse;
import org.example.cursosservice.Dto.SubcategoriaRequest;
import org.example.cursosservice.Dto.SubcategoriaResponse;
import org.example.cursosservice.Service.CursoService;
import org.example.cursosservice.Service.SubcategoriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subcategories")
public class SubcategoriaController {

    private final SubcategoriaService subcategoriaService;
    private final CursoService cursoService;

    public SubcategoriaController(SubcategoriaService subcategoriaService, CursoService cursoService) {
        this.subcategoriaService = subcategoriaService;
        this.cursoService = cursoService;
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubcategoriaResponse> update(@PathVariable Long id, @RequestBody SubcategoriaRequest request) {
        return ResponseEntity.ok(subcategoriaService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subcategoriaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-visibility")
    public ResponseEntity<SubcategoriaResponse> toggleVisibility(@PathVariable Long id) {
        return ResponseEntity.ok(subcategoriaService.toggleVisibility(id));
    }

    @GetMapping("/{id}/courses")
    public ResponseEntity<List<CursoResponse>> getCourses(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.getBySubcategoria(id));
    }

    @PostMapping("/{id}/courses")
    public ResponseEntity<CursoResponse> createCourse(@PathVariable Long id, @RequestBody CursoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cursoService.create(id, request));
    }
}
