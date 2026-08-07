package org.example.comentariosservice.Service;

import org.example.comentariosservice.Dto.CommentResponse;
import org.example.comentariosservice.Dto.CreateCommentRequest;
import org.example.comentariosservice.Dto.ReplyRequest;
import org.example.comentariosservice.Dto.ReportRequest;

import java.util.List;

public interface ComentarioService {

    List<CommentResponse> getComments(Long cursoId, String cycle, Long scheduleId);

    CommentResponse createComment(Long cursoId, Long userId, CreateCommentRequest request);

    CommentResponse createReply(Long cursoId, Long parentCommentId, Long userId, ReplyRequest request);

    CommentResponse toggleLike(Long commentId, Long userId);

    CommentResponse toggleDislike(Long commentId, Long userId);

    void reportComment(Long commentId, Long userId, ReportRequest request);
}
