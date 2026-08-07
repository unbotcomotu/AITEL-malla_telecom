package org.example.cursosservice.Controller;

import org.example.cursosservice.Dto.CurriculumResponse;
import org.example.cursosservice.Model.PrerequisiteTypes;
import org.example.cursosservice.Service.CursoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/curriculum")
public class CurriculumController {

    private final CursoService cursoService;

    public CurriculumController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    @GetMapping
    public CurriculumResponse getCurriculum() {
        return cursoService.buildCurriculum();
    }

    @GetMapping("/prerequisite-types")
    public Map<String, String> getPrerequisiteTypes() {
        Map<String, String> types = new LinkedHashMap<>();
        types.put("APPROVED", PrerequisiteTypes.APPROVED);
        types.put("MIN_GRADE", PrerequisiteTypes.MIN_GRADE);
        types.put("COREQUISITE", PrerequisiteTypes.COREQUISITE);
        return types;
    }
}
