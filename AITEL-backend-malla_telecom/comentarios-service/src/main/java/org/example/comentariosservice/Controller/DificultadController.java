package org.example.comentariosservice.Controller;

import org.example.comentariosservice.Dto.DifficultySummaryResponse;
import org.example.comentariosservice.Dto.RatingRequest;
import org.example.comentariosservice.Service.DificultadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{cursoId}/difficulty")
public class DificultadController {

    private final DificultadService dificultadService;

    public DificultadController(DificultadService dificultadService) {
        this.dificultadService = dificultadService;
    }

    @PostMapping
    public ResponseEntity<DifficultySummaryResponse> rate(@PathVariable Long cursoId,
                                                            @RequestHeader("X-User-Id") Long userId,
                                                            @RequestBody RatingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(dificultadService.rate(cursoId, userId, request));
    }

    @GetMapping("/summary")
    public ResponseEntity<DifficultySummaryResponse> getSummary(
            @PathVariable Long cursoId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(value = "cycle", required = false) String cycle,
            @RequestParam(value = "schedule", required = false) Long scheduleId,
            @RequestParam(value = "lastSemesters", required = false) Integer lastSemesters) {
        return ResponseEntity.ok(dificultadService.getSummary(cursoId, userId, cycle, scheduleId, lastSemesters));
    }
}
