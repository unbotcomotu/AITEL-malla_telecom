package org.example.cursosservice.Service;

import org.example.cursosservice.Dto.CurriculumNodeResponse;
import org.example.cursosservice.Dto.CurriculumResponse;
import org.example.cursosservice.Dto.CursoRequest;
import org.example.cursosservice.Dto.CursoResponse;
import org.example.cursosservice.Dto.PrerequisiteResponse;

import java.util.List;

public interface CursoService {

    List<CursoResponse> getAllForCatalog();

    List<CursoResponse> getBySubcategoria(Long subcategoriaId);

    CursoResponse getById(Long id);

    CursoResponse create(Long subcategoriaId, CursoRequest request);

    CursoResponse update(Long id, CursoRequest request);

    void delete(Long id);

    CursoResponse toggleVisibility(Long id);

    List<CurriculumNodeResponse> getPrerequisiteCandidates();

    List<PrerequisiteResponse> getCoursePrerequisites(Long courseId);

    CurriculumResponse buildCurriculum();
}
