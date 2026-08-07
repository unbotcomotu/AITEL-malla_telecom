package org.example.semestresservice.Controller;

import org.example.semestresservice.Dto.AcademicInfoResponse;
import org.example.semestresservice.Dto.CurrentCourseResponse;
import org.example.semestresservice.Dto.RegisterSemesterRequest;
import org.example.semestresservice.Dto.SemesterHistoryEntry;
import org.example.semestresservice.Dto.ValidatePrerequisitesRequest;
import org.example.semestresservice.Dto.ValidationResponse;
import org.example.semestresservice.Exception.ApiException;
import org.example.semestresservice.Service.StudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/student/academic-info")
    public ResponseEntity<AcademicInfoResponse> getAcademicInfo(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(studentService.getAcademicInfo(userId));
    }

    @GetMapping("/student/grades")
    public ResponseEntity<Map<Long, Long>> getGrades(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(studentService.getGrades(userId));
    }

    @GetMapping("/student/current-courses")
    public ResponseEntity<List<CurrentCourseResponse>> getCurrentCourses(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(studentService.getCurrentCourses(userId));
    }

    @GetMapping("/student/semester-history")
    public ResponseEntity<List<SemesterHistoryEntry>> getSemesterHistory(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(studentService.getSemesterHistory(userId));
    }

    @GetMapping("/student/semesters")
    public ResponseEntity<List<SemesterHistoryEntry>> getRegisteredSemesters(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(studentService.getSemesterHistory(userId));
    }

    @PostMapping("/student/semesters")
    public ResponseEntity<SemesterHistoryEntry> registerSemester(@RequestHeader("X-User-Id") Long userId, @RequestBody RegisterSemesterRequest request) {
        SemesterHistoryEntry entry = studentService.registerSemester(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(entry);
    }

    @PostMapping("/student/validate-prerequisites")
    public ResponseEntity<ValidationResponse> validatePrerequisites(@RequestHeader("X-User-Id") Long userId,
                                                                      @RequestBody ValidatePrerequisitesRequest request) {
        return ResponseEntity.ok(studentService.validatePrerequisites(userId, request));
    }

    @PostMapping("/student/complete-registration")
    public ResponseEntity<Void> completeRegistration(@RequestHeader("X-User-Id") Long userId) {
        studentService.completeRegistration(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/student/academic-history")
    public ResponseEntity<Void> resetAcademicHistory(@RequestHeader("X-User-Id") Long userId) {
        studentService.resetAcademicHistory(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/student/available-courses")
    public ResponseEntity<Map<String, Object>> getAvailableCoursesForSemester(@RequestHeader("X-User-Id") Long userId,
                                                                                @RequestBody Map<String, Object> body) {
        Long cycle = extraerCiclo(body.get("cycle"), "cycle");
        return ResponseEntity.ok(studentService.getAvailableCoursesForSemester(userId, cycle));
    }

    @GetMapping("/courses/available")
    public ResponseEntity<Map<String, Object>> getAvailableCoursesByCycle(@RequestParam("cycle") Long cycle) {
        return ResponseEntity.ok(studentService.getAvailableCoursesByCycle(cycle));
    }

    private Long extraerCiclo(Object valor, String campo) {
        if (valor == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El campo " + campo + " es requerido.");
        }
        if (valor instanceof Number numero) {
            return numero.longValue();
        }
        try {
            return Long.valueOf(valor.toString());
        } catch (NumberFormatException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El campo " + campo + " debe ser un número.");
        }
    }
}
