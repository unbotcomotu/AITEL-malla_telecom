package org.example.semestresservice.Service;

import org.example.semestresservice.Client.UsuarioServiceClient;
import org.example.semestresservice.Dto.BloqueResponse;
import org.example.semestresservice.Dto.HorarioResponse;
import org.example.semestresservice.Dto.ProfesorResumen;
import org.example.semestresservice.Dto.ScheduleRequest;
import org.example.semestresservice.Exception.ApiException;
import org.example.semestresservice.Model.Entity.BloqueHorario;
import org.example.semestresservice.Model.Entity.Horario;
import org.example.semestresservice.Model.Entity.HorarioProfesor;
import org.example.semestresservice.Model.Entity.Semestre;
import org.example.semestresservice.Model.TipoHorario;
import org.example.semestresservice.Model.Usuario;
import org.example.semestresservice.Repository.HorarioRepository;
import org.example.semestresservice.Repository.SemestreRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class HorarioServiceImpl implements HorarioService {

    private final HorarioRepository horarioRepository;
    private final SemestreRepository semestreRepository;
    private final UsuarioServiceClient usuarioServiceClient;

    public HorarioServiceImpl(HorarioRepository horarioRepository,
                               SemestreRepository semestreRepository,
                               UsuarioServiceClient usuarioServiceClient) {
        this.horarioRepository = horarioRepository;
        this.semestreRepository = semestreRepository;
        this.usuarioServiceClient = usuarioServiceClient;
    }

    @Override
    @Transactional(readOnly = true)
    public List<HorarioResponse> getSchedulesByCourse(Long courseId) {
        return horarioRepository.findByIdCurso(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getScheduleInfo(Long courseId) {
        Map<String, List<HorarioResponse>> agrupado = new LinkedHashMap<>();
        for (Horario horario : horarioRepository.findByIdCurso(courseId)) {
            String ciclo = horario.getSemestre().getSemestre();
            agrupado.computeIfAbsent(ciclo, k -> new ArrayList<>()).add(toResponse(horario));
        }

        Map<String, Object> resultado = new LinkedHashMap<>();
        agrupado.forEach((ciclo, horarios) -> resultado.put(ciclo, Map.of("schedules", horarios)));
        return resultado;
    }

    @Override
    @Transactional
    public void createCycle(Long courseId, String cycle) {
        obtenerOCrearSemestre(cycle);
    }

    @Override
    @Transactional
    public void deleteCycle(Long courseId, String cycle) {
        List<Horario> horarios = horarioRepository.findByIdCursoAndSemestre_Semestre(courseId, cycle);
        horarioRepository.deleteAll(horarios);
    }

    @Override
    @Transactional
    public HorarioResponse createSchedule(Long courseId, String cycle, ScheduleRequest request) {
        Semestre semestre = obtenerOCrearSemestre(cycle);

        Horario horario = new Horario();
        horario.setIdCurso(courseId);
        horario.setSemestre(semestre);
        horario.setHorario(request.getSchedule());
        horario.setTipo(request.getType() == null ? TipoHorario.CLASE : request.getType());
        horario.setHorarioAsociado(request.getAssociatedSchedule());
        asignarProfesores(horario, request.getProfessorIds());
        asignarBloques(horario, request.getBlocks());

        return toResponse(horarioRepository.save(horario));
    }

    @Override
    @Transactional
    public HorarioResponse updateSchedule(Long courseId, String cycle, Long scheduleId, ScheduleRequest request) {
        Horario horario = buscar(scheduleId);
        if (request.getSchedule() != null) {
            horario.setHorario(request.getSchedule());
        }
        if (request.getType() != null) {
            horario.setTipo(request.getType());
        }
        if (request.getAssociatedSchedule() != null) {
            horario.setHorarioAsociado(request.getAssociatedSchedule());
        }
        if (request.getProfessorIds() != null) {
            horario.getHorarioProfesores().clear();
            asignarProfesores(horario, request.getProfessorIds());
        }
        if (request.getBlocks() != null) {
            horario.getBloques().clear();
            asignarBloques(horario, request.getBlocks());
        }
        return toResponse(horarioRepository.save(horario));
    }

    @Override
    @Transactional
    public void deleteSchedule(Long scheduleId) {
        horarioRepository.delete(buscar(scheduleId));
    }

    @Override
    @Transactional
    public List<HorarioResponse> bulkSaveSchedules(Long courseId, String cycle, List<ScheduleRequest> requests) {
        List<HorarioResponse> resultado = new ArrayList<>();
        for (ScheduleRequest request : requests) {
            resultado.add(createSchedule(courseId, cycle, request));
        }
        return resultado;
    }

    private void asignarBloques(Horario horario, List<ScheduleRequest.BloqueRequest> bloques) {
        if (bloques == null) {
            return;
        }
        for (ScheduleRequest.BloqueRequest peticion : bloques) {
            if (peticion.getDay() == null || peticion.getStartTime() == null || peticion.getEndTime() == null) {
                continue;
            }
            BloqueHorario bloque = new BloqueHorario();
            bloque.setHorario(horario);
            bloque.setDia(peticion.getDay());
            bloque.setHoraInicio(parsearHora(peticion.getStartTime()));
            bloque.setHoraFin(parsearHora(peticion.getEndTime()));
            bloque.setAula(peticion.getClassroom());
            horario.getBloques().add(bloque);
        }
    }

    private LocalTime parsearHora(String valor) {
        try {
            return LocalTime.parse(valor.trim().length() == 5 ? valor.trim() : valor.trim().substring(0, 5));
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Hora inválida: " + valor + " (se espera HH:mm).");
        }
    }

    private void asignarProfesores(Horario horario, List<Long> professorIds) {
        if (professorIds == null) {
            return;
        }
        for (Long idProfesor : professorIds) {
            HorarioProfesor hp = new HorarioProfesor();
            hp.setHorario(horario);
            hp.setIdProfesor(idProfesor);
            horario.getHorarioProfesores().add(hp);
        }
    }

    private Semestre obtenerOCrearSemestre(String nombre) {
        return semestreRepository.findBySemestre(nombre).orElseGet(() -> {
            Semestre nuevo = new Semestre();
            nuevo.setSemestre(nombre);
            nuevo.setActivo(false);
            return semestreRepository.save(nuevo);
        });
    }

    private Horario buscar(Long id) {
        return horarioRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Horario no encontrado."));
    }

    private HorarioResponse toResponse(Horario horario) {
        List<ProfesorResumen> profesores = horario.getHorarioProfesores().stream()
                .map(hp -> {
                    try {
                        Usuario usuario = usuarioServiceClient.getUsuarioById(hp.getIdProfesor());
                        return new ProfesorResumen(hp.getIdProfesor(), usuario.getFullName());
                    } catch (Exception e) {
                        return new ProfesorResumen(hp.getIdProfesor(), "Profesor #" + hp.getIdProfesor());
                    }
                })
                .toList();

        List<BloqueResponse> bloques = horario.getBloques().stream()
                .sorted(Comparator.comparing(BloqueHorario::getDia)
                        .thenComparing(BloqueHorario::getHoraInicio))
                .map(b -> new BloqueResponse(b.getId(), b.getDia(), b.getHoraInicio(), b.getHoraFin(), b.getAula()))
                .toList();

        return new HorarioResponse(
                horario.getId(),
                horario.getIdCurso(),
                horario.getSemestre().getSemestre(),
                horario.getHorario(),
                horario.getHorarioAsociado(),
                horario.getTipo(),
                bloques,
                profesores,
                horario.getMatriculas().size()
        );
    }
}
