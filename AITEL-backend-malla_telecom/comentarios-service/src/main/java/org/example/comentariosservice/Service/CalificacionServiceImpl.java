package org.example.comentariosservice.Service;

import org.example.comentariosservice.Dto.RatingRequest;
import org.example.comentariosservice.Dto.RatingSummaryResponse;
import org.example.comentariosservice.Exception.ApiException;
import org.example.comentariosservice.Model.Entity.Calificacion;
import org.example.comentariosservice.Repository.CalificacionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CalificacionServiceImpl implements CalificacionService {

    private static final String CICLO_GENERAL = "Todos";

    private final CalificacionRepository calificacionRepository;

    public CalificacionServiceImpl(CalificacionRepository calificacionRepository) {
        this.calificacionRepository = calificacionRepository;
    }

    @Override
    @Transactional
    public RatingSummaryResponse rate(Long cursoId, Long userId, RatingRequest request) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La calificacion debe estar entre 1 y 5.");
        }

        String ciclo = request.getCycle() == null || request.getCycle().isBlank() ? CICLO_GENERAL : request.getCycle();

        Calificacion calificacion = calificacionRepository
                .findExistente(cursoId, ciclo, request.getScheduleId(), userId)
                .orElseGet(Calificacion::new);

        calificacion.setIdCurso(cursoId);
        calificacion.setCicloAcademico(ciclo);
        calificacion.setIdHorario(request.getScheduleId());
        calificacion.setIdUsuario(userId);
        calificacion.setPuntuacion(request.getRating());
        calificacion.setFechaCreacion(LocalDateTime.now());
        calificacionRepository.save(calificacion);

        return getSummary(cursoId, ciclo);
    }

    @Override
    @Transactional(readOnly = true)
    public RatingSummaryResponse getSummary(Long cursoId, String cycle) {
        List<Calificacion> calificaciones = (cycle == null || cycle.isBlank())
                ? calificacionRepository.findByIdCurso(cursoId)
                : calificacionRepository.findByIdCursoAndCicloAcademico(cursoId, cycle);

        if (calificaciones.isEmpty()) {
            return new RatingSummaryResponse(0, 0);
        }

        double promedio = calificaciones.stream().mapToInt(Calificacion::getPuntuacion).average().orElse(0);
        return new RatingSummaryResponse(promedio, calificaciones.size());
    }
}
