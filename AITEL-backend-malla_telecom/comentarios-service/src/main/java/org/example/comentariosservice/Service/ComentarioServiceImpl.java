package org.example.comentariosservice.Service;

import org.example.comentariosservice.Client.UsuarioServiceClient;
import org.example.comentariosservice.Dto.CommentResponse;
import org.example.comentariosservice.Dto.CreateCommentRequest;
import org.example.comentariosservice.Dto.ReplyRequest;
import org.example.comentariosservice.Dto.ReportRequest;
import org.example.comentariosservice.Exception.ApiException;
import org.example.comentariosservice.Model.Entity.Comentario;
import org.example.comentariosservice.Model.Entity.ComentarioReaccion;
import org.example.comentariosservice.Model.Entity.ComentarioReporte;
import org.example.comentariosservice.Model.Semestres;
import org.example.comentariosservice.Model.TipoReaccion;
import org.example.comentariosservice.Repository.ComentarioReaccionRepository;
import org.example.comentariosservice.Repository.ComentarioReporteRepository;
import org.example.comentariosservice.Repository.ComentarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ComentarioServiceImpl implements ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final ComentarioReaccionRepository reaccionRepository;
    private final ComentarioReporteRepository reporteRepository;
    private final UsuarioServiceClient usuarioServiceClient;

    public ComentarioServiceImpl(ComentarioRepository comentarioRepository,
                                  ComentarioReaccionRepository reaccionRepository,
                                  ComentarioReporteRepository reporteRepository,
                                  UsuarioServiceClient usuarioServiceClient) {
        this.comentarioRepository = comentarioRepository;
        this.reaccionRepository = reaccionRepository;
        this.reporteRepository = reporteRepository;
        this.usuarioServiceClient = usuarioServiceClient;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long cursoId, String cycle, Long scheduleId, Integer lastSemesters) {
        // Se parte del hilo completo del curso y se va recortando. Antes se
        // consultaba directo por ciclo, lo que dejaba fuera todo lo que no
        // fuera del pseudo-ciclo "Todos" en la vista por defecto: comentar sin
        // horario es libre, asi que sin filtros hay que mostrarlo todo.
        List<Comentario> comentarios = comentarioRepository.findByIdCursoOrderByFechaCreacionAsc(cursoId);

        if (!Semestres.esGeneral(cycle)) {
            comentarios = comentarios.stream()
                    .filter(c -> cycle.equals(c.getCicloAcademico()))
                    .toList();
        } else if (lastSemesters != null && lastSemesters > 0) {
            Set<String> recientes = Semestres.ultimos(
                    comentarios.stream().map(Comentario::getCicloAcademico).toList(), lastSemesters);
            comentarios = comentarios.stream()
                    .filter(c -> recientes.contains(c.getCicloAcademico()))
                    .toList();
        }

        if (scheduleId != null) {
            comentarios = comentarios.stream()
                    .filter(c -> scheduleId.equals(c.getIdHorario()))
                    .toList();
        }

        if (comentarios.isEmpty()) {
            return List.of();
        }

        List<Long> ids = comentarios.stream().map(Comentario::getId).toList();
        Map<Long, List<ComentarioReaccion>> reaccionesPorComentario = reaccionRepository.findByIdComentarioIn(ids).stream()
                .collect(Collectors.groupingBy(ComentarioReaccion::getIdComentario));

        Map<Long, List<Comentario>> porPadre = comentarios.stream()
                .collect(Collectors.groupingBy(c -> c.getIdComentarioPadre() == null ? 0L : c.getIdComentarioPadre()));

        return construirNivel(porPadre.getOrDefault(0L, List.of()), porPadre, reaccionesPorComentario);
    }

    @Override
    @Transactional
    public CommentResponse createComment(Long cursoId, Long userId, CreateCommentRequest request) {
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El comentario no puede estar vacio.");
        }

        Comentario comentario = new Comentario();
        comentario.setIdCurso(cursoId);
        comentario.setCicloAcademico(Semestres.esGeneral(request.getCycle()) ? Semestres.GENERAL : request.getCycle());
        comentario.setIdHorario(request.getScheduleId());
        comentario.setIdUsuario(userId);
        comentario.setAutorNombre(obtenerNombreUsuario(userId));
        comentario.setContenido(request.getContent());
        comentario.setFechaCreacion(LocalDateTime.now());

        return toResponseSinHijos(comentarioRepository.save(comentario));
    }

    @Override
    @Transactional
    public CommentResponse createReply(Long cursoId, Long parentCommentId, Long userId, ReplyRequest request) {
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La respuesta no puede estar vacia.");
        }

        Comentario padre = buscar(parentCommentId);
        if (!padre.getIdCurso().equals(cursoId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El comentario no pertenece a este curso.");
        }

        Comentario respuesta = new Comentario();
        respuesta.setIdCurso(cursoId);
        respuesta.setCicloAcademico(padre.getCicloAcademico());
        respuesta.setIdHorario(padre.getIdHorario());
        respuesta.setIdUsuario(userId);
        respuesta.setAutorNombre(obtenerNombreUsuario(userId));
        respuesta.setContenido(request.getContent());
        respuesta.setFechaCreacion(LocalDateTime.now());
        respuesta.setIdComentarioPadre(parentCommentId);

        return toResponseSinHijos(comentarioRepository.save(respuesta));
    }

    @Override
    @Transactional
    public CommentResponse toggleLike(Long commentId, Long userId) {
        return alternarReaccion(commentId, userId, TipoReaccion.LIKE);
    }

    @Override
    @Transactional
    public CommentResponse toggleDislike(Long commentId, Long userId) {
        return alternarReaccion(commentId, userId, TipoReaccion.DISLIKE);
    }

    @Override
    @Transactional
    public void reportComment(Long commentId, Long userId, ReportRequest request) {
        buscar(commentId);

        ComentarioReporte reporte = new ComentarioReporte();
        reporte.setIdComentario(commentId);
        reporte.setIdUsuario(userId);
        reporte.setMotivo(request.getReason());
        reporte.setFechaCreacion(LocalDateTime.now());
        reporteRepository.save(reporte);
    }

    private CommentResponse alternarReaccion(Long commentId, Long userId, TipoReaccion tipo) {
        Comentario comentario = buscar(commentId);

        reaccionRepository.findByIdComentarioAndIdUsuario(commentId, userId).ifPresentOrElse(existente -> {
            if (existente.getTipo() == tipo) {
                reaccionRepository.delete(existente);
            } else {
                existente.setTipo(tipo);
                reaccionRepository.save(existente);
            }
        }, () -> {
            ComentarioReaccion nueva = new ComentarioReaccion();
            nueva.setIdComentario(commentId);
            nueva.setIdUsuario(userId);
            nueva.setTipo(tipo);
            reaccionRepository.save(nueva);
        });

        long likes = reaccionRepository.countByIdComentarioAndTipo(commentId, TipoReaccion.LIKE);
        long dislikes = reaccionRepository.countByIdComentarioAndTipo(commentId, TipoReaccion.DISLIKE);
        List<Long> likedBy = reaccionRepository.findByIdComentarioIn(List.of(commentId)).stream()
                .filter(r -> r.getTipo() == TipoReaccion.LIKE).map(ComentarioReaccion::getIdUsuario).toList();
        List<Long> dislikedBy = reaccionRepository.findByIdComentarioIn(List.of(commentId)).stream()
                .filter(r -> r.getTipo() == TipoReaccion.DISLIKE).map(ComentarioReaccion::getIdUsuario).toList();

        return new CommentResponse(comentario.getId(), comentario.getAutorNombre(), comentario.getIdUsuario(),
                comentario.getContenido(), comentario.getFechaCreacion().toString(), likes, dislikes,
                likedBy, dislikedBy, List.of());
    }

    private List<CommentResponse> construirNivel(List<Comentario> nivel, Map<Long, List<Comentario>> porPadre,
                                                  Map<Long, List<ComentarioReaccion>> reaccionesPorComentario) {
        return nivel.stream()
                .sorted(Comparator.comparing(Comentario::getFechaCreacion))
                .map(c -> {
                    List<ComentarioReaccion> reacciones = reaccionesPorComentario.getOrDefault(c.getId(), List.of());
                    List<Long> likedBy = reacciones.stream().filter(r -> r.getTipo() == TipoReaccion.LIKE)
                            .map(ComentarioReaccion::getIdUsuario).toList();
                    List<Long> dislikedBy = reacciones.stream().filter(r -> r.getTipo() == TipoReaccion.DISLIKE)
                            .map(ComentarioReaccion::getIdUsuario).toList();
                    List<CommentResponse> hijos = construirNivel(porPadre.getOrDefault(c.getId(), List.of()), porPadre, reaccionesPorComentario);

                    return new CommentResponse(c.getId(), c.getAutorNombre(), c.getIdUsuario(), c.getContenido(),
                            c.getFechaCreacion().toString(), likedBy.size(), dislikedBy.size(), likedBy, dislikedBy, hijos);
                })
                .toList();
    }

    private CommentResponse toResponseSinHijos(Comentario comentario) {
        return new CommentResponse(comentario.getId(), comentario.getAutorNombre(), comentario.getIdUsuario(),
                comentario.getContenido(), comentario.getFechaCreacion().toString(), 0, 0, List.of(), List.of(), List.of());
    }

    private Comentario buscar(Long id) {
        return comentarioRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Comentario no encontrado."));
    }

    private String obtenerNombreUsuario(Long userId) {
        try {
            return usuarioServiceClient.getUsuarioById(userId).getFullName();
        } catch (Exception e) {
            return "Usuario";
        }
    }
}
