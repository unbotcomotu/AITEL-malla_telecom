package org.example.comentariosservice.Controller;

import org.example.comentariosservice.Dto.RatingRequest;
import org.example.comentariosservice.Dto.RatingSummaryResponse;
import org.example.comentariosservice.Service.CalificacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{cursoId}/ratings")
public class CalificacionController {

    private final CalificacionService calificacionService;

    public CalificacionController(CalificacionService calificacionService) {
        this.calificacionService = calificacionService;
    }

    @PostMapping
    public ResponseEntity<RatingSummaryResponse> rate(@PathVariable Long cursoId,
                                                        @RequestHeader("X-User-Id") Long userId,
                                                        @RequestBody RatingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(calificacionService.rate(cursoId, userId, request));
    }

    @GetMapping("/summary")
    public ResponseEntity<RatingSummaryResponse> getSummary(@PathVariable Long cursoId,
                                                              @RequestParam(value = "cycle", required = false) String cycle) {
        return ResponseEntity.ok(calificacionService.getSummary(cursoId, cycle));
    }
}
