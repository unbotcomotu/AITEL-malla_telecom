package org.example.cursosservice.Controller;

import org.example.cursosservice.Dto.CategoriaRequest;
import org.example.cursosservice.Dto.CategoriaResponse;
import org.example.cursosservice.Dto.SubcategoriaRequest;
import org.example.cursosservice.Dto.SubcategoriaResponse;
import org.example.cursosservice.Service.CategoriaService;
import org.example.cursosservice.Service.SubcategoriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoriaController {

    private final CategoriaService categoriaService;
    private final SubcategoriaService subcategoriaService;

    public CategoriaController(CategoriaService categoriaService, SubcategoriaService subcategoriaService) {
        this.categoriaService = categoriaService;
        this.subcategoriaService = subcategoriaService;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaResponse>> getAll() {
        return ResponseEntity.ok(categoriaService.getAll());
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> create(@RequestBody CategoriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponse> update(@PathVariable Long id, @RequestBody CategoriaRequest request) {
        return ResponseEntity.ok(categoriaService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoriaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-hidden")
    public ResponseEntity<CategoriaResponse> toggleHidden(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.toggleHidden(id));
    }

    @GetMapping("/{id}/subcategories")
    public ResponseEntity<List<SubcategoriaResponse>> getSubcategories(@PathVariable Long id) {
        return ResponseEntity.ok(subcategoriaService.getByCategoria(id));
    }

    @PostMapping("/{id}/subcategories")
    public ResponseEntity<SubcategoriaResponse> createSubcategory(@PathVariable Long id, @RequestBody SubcategoriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subcategoriaService.create(id, request));
    }
}
