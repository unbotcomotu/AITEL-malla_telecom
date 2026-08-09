package org.example.comentariosservice.Service;

import org.example.comentariosservice.Dto.CommentResponse;
import org.example.comentariosservice.Dto.CreateCommentRequest;
import org.example.comentariosservice.Dto.ReplyRequest;
import org.example.comentariosservice.Dto.ReportRequest;

import java.util.List;

public interface ComentarioService {

    /**
     * @param cycle         ciclo exacto, o null/"Todos" para no filtrar por ciclo
     * @param scheduleId    seccion concreta, o null para no filtrar
     * @param lastSemesters solo los N semestres mas recientes; se ignora si ya
     *                      se pidio un ciclo exacto
     */
    List<CommentResponse> getComments(Long cursoId, String cycle, Long scheduleId, Integer lastSemesters);

    CommentResponse createComment(Long cursoId, Long userId, CreateCommentRequest request);

    CommentResponse createReply(Long cursoId, Long parentCommentId, Long userId, ReplyRequest request);

    CommentResponse toggleLike(Long commentId, Long userId);

    CommentResponse toggleDislike(Long commentId, Long userId);

    void reportComment(Long commentId, Long userId, ReportRequest request);
}
