package org.example.comentariosservice.Service;

import org.example.comentariosservice.Dto.DifficultySummaryResponse;
import org.example.comentariosservice.Dto.RatingRequest;
import org.example.comentariosservice.Exception.ApiException;
import org.example.comentariosservice.Model.Entity.Dificultad;
import org.example.comentariosservice.Model.Semestres;
import org.example.comentariosservice.Repository.DificultadRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class DificultadServiceImpl implements DificultadService {

    private final DificultadRepository dificultadRepository;

    public DificultadServiceImpl(DificultadRepository dificultadRepository) {
        this.dificultadRepository = dificultadRepository;
    }

    @Override
    @Transactional
    public DifficultySummaryResponse rate(Long cursoId, Long userId, RatingRequest request) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La dificultad debe estar entre 1 y 5.");
        }

        String ciclo = Semestres.esGeneral(request.getCycle()) ? Semestres.GENERAL : request.getCycle();

        Dificultad dificultad = dificultadRepository
                .findExistente(cursoId, ciclo, request.getScheduleId(), userId)
                .orElseGet(Dificultad::new);

        dificultad.setIdCurso(cursoId);
        dificultad.setCicloAcademico(ciclo);
        dificultad.setIdHorario(request.getScheduleId());
        dificultad.setIdUsuario(userId);
        dificultad.setPuntuacion(request.getRating());
        dificultad.setFechaCreacion(LocalDateTime.now());
        dificultadRepository.save(dificultad);

        return getSummary(cursoId, userId, request.getCycle(), request.getScheduleId(), null);
    }

    @Override
    @Transactional(readOnly = true)
    public DifficultySummaryResponse getSummary(Long cursoId, Long userId, String cycle, Long scheduleId, Integer lastSemesters) {
        List<Dificultad> votos = dificultadRepository.findByIdCurso(cursoId);

        // Los filtros se aplican en memoria porque se combinan entre si y el
        // volumen por curso es chico (un voto por alumno y oferta).
        if (!Semestres.esGeneral(cycle)) {
            votos = votos.stream().filter(d -> cycle.equals(d.getCicloAcademico())).toList();
        } else if (lastSemesters != null && lastSemesters > 0) {
            Set<String> recientes = Semestres.ultimos(
                    votos.stream().map(Dificultad::getCicloAcademico).toList(), lastSemesters);
            votos = votos.stream().filter(d -> recientes.contains(d.getCicloAcademico())).toList();
        }

        if (scheduleId != null) {
            votos = votos.stream().filter(d -> scheduleId.equals(d.getIdHorario())).toList();
        }

        Integer miVoto = votos.stream()
                .filter(d -> d.getIdUsuario().equals(userId))
                .map(Dificultad::getPuntuacion)
                .findFirst()
                .orElse(null);

        if (votos.isEmpty()) {
            return new DifficultySummaryResponse(0, 0, miVoto);
        }

        double promedio = votos.stream().mapToInt(Dificultad::getPuntuacion).average().orElse(0);
        return new DifficultySummaryResponse(promedio, votos.size(), miVoto);
    }
}
