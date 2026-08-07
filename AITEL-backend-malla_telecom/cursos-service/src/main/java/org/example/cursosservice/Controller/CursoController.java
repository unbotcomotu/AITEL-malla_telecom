package org.example.cursosservice.Controller;

import org.example.cursosservice.Dto.CurriculumNodeResponse;
import org.example.cursosservice.Dto.CursoRequest;
import org.example.cursosservice.Dto.CursoResponse;
import org.example.cursosservice.Dto.PrerequisiteResponse;
import org.example.cursosservice.Service.CursoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
public class CursoController {

    private final CursoService cursoService;

    public CursoController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    @GetMapping("/prerequisites")
    public ResponseEntity<List<CurriculumNodeResponse>> getPrerequisiteCandidates() {
        return ResponseEntity.ok(cursoService.getPrerequisiteCandidates());
    }

    @GetMapping("/{id}/prerequisites")
    public ResponseEntity<List<PrerequisiteResponse>> getCoursePrerequisites(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.getCoursePrerequisites(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CursoResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CursoResponse> update(@PathVariable Long id, @RequestBody CursoRequest request) {
        return ResponseEntity.ok(cursoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        cursoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-visibility")
    public ResponseEntity<CursoResponse> toggleVisibility(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.toggleVisibility(id));
    }
}
