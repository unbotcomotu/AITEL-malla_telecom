package org.example.semestresservice.Controller;

import org.example.semestresservice.Service.SemestreService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/system")
public class SystemController {

    private final SemestreService semestreService;

    public SystemController(SemestreService semestreService) {
        this.semestreService = semestreService;
    }

    @GetMapping("/current-cycle")
    public Map<String, String> getCurrentCycle() {
        String cycle = semestreService.getActivo()
                .map(s -> s.getSemestre())
                .orElse(null);
        return Map.of("currentCycle", cycle == null ? "" : cycle);
    }
}
