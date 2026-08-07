package org.example.semestresservice.Controller;

import org.example.semestresservice.Dto.SemestreResponse;
import org.example.semestresservice.Service.SemestreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/semesters")
public class SemestreController {

    private final SemestreService semestreService;

    public SemestreController(SemestreService semestreService) {
        this.semestreService = semestreService;
    }

    @GetMapping
    public ResponseEntity<List<SemestreResponse>> getAll() {
        return ResponseEntity.ok(semestreService.getAll());
    }

    @PostMapping
    public ResponseEntity<SemestreResponse> create(@RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(semestreService.create(body.get("semester")));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<SemestreResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(semestreService.activate(id));
    }
}
