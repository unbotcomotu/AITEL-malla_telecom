package org.example.semestresservice.Client;

import org.example.semestresservice.Model.Curso;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "cursos-service", url = "${cursos-service.url}")
public interface CursoServiceClient {

    @GetMapping("/courses/{id}")
    Curso getCursoById(@PathVariable("id") Long id);

    @GetMapping("/catalog/courses")
    List<Curso> getAllCourses();
}
