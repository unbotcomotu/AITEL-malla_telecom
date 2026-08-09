package org.example.comentariosservice.Service;

import org.example.comentariosservice.Dto.DifficultySummaryResponse;
import org.example.comentariosservice.Dto.RatingRequest;

public interface DificultadService {
    DifficultySummaryResponse rate(Long cursoId, Long userId, RatingRequest request);

    DifficultySummaryResponse getSummary(Long cursoId, Long userId, String cycle, Long scheduleId, Integer lastSemesters);
}
