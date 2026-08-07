package org.example.comentariosservice.Service;

import org.example.comentariosservice.Dto.RatingRequest;
import org.example.comentariosservice.Dto.RatingSummaryResponse;

public interface CalificacionService {

    RatingSummaryResponse rate(Long cursoId, Long userId, RatingRequest request);

    RatingSummaryResponse getSummary(Long cursoId, String cycle);
}
