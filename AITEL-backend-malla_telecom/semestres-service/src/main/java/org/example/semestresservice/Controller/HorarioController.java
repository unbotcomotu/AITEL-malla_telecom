package org.example.semestresservice.Controller;

import org.example.semestresservice.Dto.HorarioResponse;
import org.example.semestresservice.Dto.ScheduleRequest;
import org.example.semestresservice.Service.HorarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/courses/{courseId}")
public class HorarioController {

    private final HorarioService horarioService;

    public HorarioController(HorarioService horarioService) {
        this.horarioService = horarioService;
    }

    @GetMapping("/schedules")
    public ResponseEntity<List<HorarioResponse>> getSchedules(@PathVariable Long courseId) {
        return ResponseEntity.ok(horarioService.getSchedulesByCourse(courseId));
    }

    @GetMapping("/schedule-info")
    public ResponseEntity<Map<String, Object>> getScheduleInfo(@PathVariable Long courseId) {
        return ResponseEntity.ok(horarioService.getScheduleInfo(courseId));
    }

    @PostMapping("/cycles")
    public ResponseEntity<Void> createCycle(@PathVariable Long courseId, @RequestBody Map<String, String> body) {
        horarioService.createCycle(courseId, body.get("cycle"));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/cycles/{cycle}")
    public ResponseEntity<Void> deleteCycle(@PathVariable Long courseId, @PathVariable String cycle) {
        horarioService.deleteCycle(courseId, cycle);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/cycles/{cycle}/schedules")
    public ResponseEntity<HorarioResponse> createSchedule(@PathVariable Long courseId, @PathVariable String cycle,
                                                            @RequestBody ScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(horarioService.createSchedule(courseId, cycle, request));
    }

    @PutMapping("/cycles/{cycle}/schedules/{scheduleId}")
    public ResponseEntity<HorarioResponse> updateSchedule(@PathVariable Long courseId, @PathVariable String cycle,
                                                            @PathVariable Long scheduleId, @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(horarioService.updateSchedule(courseId, cycle, scheduleId, request));
    }

    @DeleteMapping("/cycles/{cycle}/schedules/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long courseId, @PathVariable String cycle, @PathVariable Long scheduleId) {
        horarioService.deleteSchedule(scheduleId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/cycles/{cycle}/schedules/bulk")
    public ResponseEntity<List<HorarioResponse>> bulkSaveSchedules(@PathVariable Long courseId, @PathVariable String cycle,
                                                                     @RequestBody Map<String, List<ScheduleRequest>> body) {
        return ResponseEntity.ok(horarioService.bulkSaveSchedules(courseId, cycle, body.get("schedules")));
    }
}
