package org.example.cursosservice.Service;

import org.example.cursosservice.Dto.CurriculumNodeResponse;
import org.example.cursosservice.Dto.CurriculumResponse;
import org.example.cursosservice.Dto.CursoRequest;
import org.example.cursosservice.Dto.CursoResponse;
import org.example.cursosservice.Dto.PrerequisiteRequest;
import org.example.cursosservice.Dto.PrerequisiteResponse;
import org.example.cursosservice.Exception.ApiException;
import org.example.cursosservice.Model.Entity.Curso;
import org.example.cursosservice.Model.Entity.CursoRequisito;
import org.example.cursosservice.Model.Entity.Subcategoria;
import org.example.cursosservice.Model.PrerequisiteTypes;
import org.example.cursosservice.Repository.CursoRepository;
import org.example.cursosservice.Repository.CursoRequisitoRepository;
import org.example.cursosservice.Repository.SubcategoriaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CursoServiceImpl implements CursoService {

    private final CursoRepository cursoRepository;
    private final SubcategoriaRepository subcategoriaRepository;
    private final CursoRequisitoRepository cursoRequisitoRepository;

    public CursoServiceImpl(CursoRepository cursoRepository,
                             SubcategoriaRepository subcategoriaRepository,
                             CursoRequisitoRepository cursoRequisitoRepository) {
        this.cursoRepository = cursoRepository;
        this.subcategoriaRepository = subcategoriaRepository;
        this.cursoRequisitoRepository = cursoRequisitoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CursoResponse> getAllForCatalog() {
        return cursoRepository.findAll().stream()
                .filter(curso -> !Boolean.TRUE.equals(curso.getOculta()))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CursoResponse> getBySubcategoria(Long subcategoriaId) {
        return cursoRepository.findBySubcategoria_Id(subcategoriaId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CursoResponse getById(Long id) {
        return toResponse(buscar(id));
    }

    @Override
    @Transactional
    public CursoResponse create(Long subcategoriaId, CursoRequest request) {
        if (request.getName() == null || request.getName().isBlank() || request.getCode() == null || request.getCode().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El nombre y el codigo del curso son requeridos.");
        }
        Subcategoria subcategoria = subcategoriaRepository.findById(subcategoriaId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Subcategoria no encontrada."));

        Curso curso = new Curso();
        curso.setSubcategoria(subcategoria);
        curso.setNombre(request.getName());
        curso.setCodigo(request.getCode());
        curso.setDescripcion(request.getDescription());
        curso.setCiclo(request.getCycle());
        curso.setCreditos(request.getCredits());
        curso.setFechaCreacion(LocalDateTime.now());
        curso.setOculta(Boolean.TRUE.equals(request.getIsHidden()));
        curso.setCongelada(Boolean.TRUE.equals(request.getIsFrozen()));
        aplicarHoras(curso, request.getHours());

        aplicarPrerrequisitos(curso, request.getPrerequisites());

        return toResponse(cursoRepository.save(curso));
    }

    @Override
    @Transactional
    public CursoResponse update(Long id, CursoRequest request) {
        Curso curso = buscar(id);

        if (request.getName() != null) {
            curso.setNombre(request.getName());
        }
        if (request.getCode() != null) {
            curso.setCodigo(request.getCode());
        }
        if (request.getDescription() != null) {
            curso.setDescripcion(request.getDescription());
        }
        if (request.getCycle() != null) {
            curso.setCiclo(request.getCycle());
        }
        if (request.getCredits() != null) {
            curso.setCreditos(request.getCredits());
        }
        if (request.getIsFrozen() != null) {
            curso.setCongelada(request.getIsFrozen());
        }
        if (request.getIsHidden() != null) {
            curso.setOculta(request.getIsHidden());
        }
        if (request.getHours() != null) {
            aplicarHoras(curso, request.getHours());
        }
        if (request.getSubcategoryId() != null) {
            Subcategoria subcategoria = subcategoriaRepository.findById(request.getSubcategoryId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Subcategoria no encontrada."));
            curso.setSubcategoria(subcategoria);
        }
        if (request.getPrerequisites() != null) {
            curso.getCursoRequisitos().clear();
            aplicarPrerrequisitos(curso, request.getPrerequisites());
        }

        return toResponse(cursoRepository.save(curso));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Curso curso = buscar(id);
        if (cursoRequisitoRepository.existsByIdCursoRequisito(id)) {
            throw new ApiException(HttpStatus.CONFLICT, "No se puede eliminar: otros cursos lo tienen como prerrequisito.");
        }
        cursoRepository.delete(curso);
    }

    @Override
    @Transactional
    public CursoResponse toggleVisibility(Long id) {
        Curso curso = buscar(id);
        curso.setOculta(!Boolean.TRUE.equals(curso.getOculta()));
        return toResponse(cursoRepository.save(curso));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CurriculumNodeResponse> getPrerequisiteCandidates() {
        return cursoRepository.findAll().stream()
                .map(CurriculumNodeResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrerequisiteResponse> getCoursePrerequisites(Long courseId) {
        Curso curso = buscar(courseId);
        return curso.getCursoRequisitos().stream()
                .map(req -> PrerequisiteResponse.from(req, courseId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CurriculumResponse buildCurriculum() {
        List<Curso> cursos = cursoRepository.findAll().stream()
                .filter(curso -> !Boolean.TRUE.equals(curso.getOculta()))
                .toList();

        List<CurriculumNodeResponse> nodes = cursos.stream()
                .map(CurriculumNodeResponse::from)
                .toList();

        List<PrerequisiteResponse> edges = new ArrayList<>();
        for (Curso curso : cursos) {
            for (CursoRequisito requisito : curso.getCursoRequisitos()) {
                edges.add(PrerequisiteResponse.from(requisito, curso.getId()));
            }
        }

        Map<String, String> prerequisiteTypes = new LinkedHashMap<>();
        prerequisiteTypes.put("APPROVED", PrerequisiteTypes.APPROVED);
        prerequisiteTypes.put("MIN_GRADE", PrerequisiteTypes.MIN_GRADE);
        prerequisiteTypes.put("COREQUISITE", PrerequisiteTypes.COREQUISITE);

        return new CurriculumResponse(nodes, edges, prerequisiteTypes);
    }

    private void aplicarHoras(Curso curso, org.example.cursosservice.Dto.HoursDto hours) {
        if (hours == null) {
            return;
        }
        if (hours.getTheory() != null) {
            curso.setHorasTeoria(hours.getTheory());
        }
        if (hours.getPractice() != null) {
            curso.setHorasPractica(hours.getPractice());
        }
        if (hours.getLab() != null) {
            curso.setHorasLaboratorio(hours.getLab());
        }
    }

    private void aplicarPrerrequisitos(Curso curso, List<PrerequisiteRequest> prerequisites) {
        if (prerequisites == null) {
            return;
        }
        for (PrerequisiteRequest req : prerequisites) {
            CursoRequisito requisito = new CursoRequisito();
            requisito.setIdCursoRequisito(req.getCourseId());
            requisito.setCondicion(req.getType());
            requisito.setNotaMinima(req.getMinGrade());
            curso.getCursoRequisitos().add(requisito);
        }
    }

    private Curso buscar(Long id) {
        return cursoRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Curso no encontrado."));
    }

    private CursoResponse toResponse(Curso curso) {
        List<PrerequisiteResponse> prerequisites = curso.getCursoRequisitos().stream()
                .map(req -> PrerequisiteResponse.from(req, curso.getId()))
                .toList();
        Integer subcategoryTotalCourses = curso.getSubcategoria() != null
                ? (int) cursoRepository.countBySubcategoria_Id(curso.getSubcategoria().getId())
                : null;
        return CursoResponse.from(curso, prerequisites, subcategoryTotalCourses);
    }
}
