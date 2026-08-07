package org.example.comentariosservice.Controller;

import org.example.comentariosservice.Dto.CommentResponse;
import org.example.comentariosservice.Dto.CreateCommentRequest;
import org.example.comentariosservice.Dto.ReplyRequest;
import org.example.comentariosservice.Dto.ReportRequest;
import org.example.comentariosservice.Service.ComentarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses/{cursoId}/comments")
public class ComentarioController {

    private final ComentarioService comentarioService;

    public ComentarioController(ComentarioService comentarioService) {
        this.comentarioService = comentarioService;
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long cursoId,
                                                               @RequestParam(value = "cycle", required = false) String cycle,
                                                               @RequestParam(value = "schedule", required = false) Long schedule) {
        return ResponseEntity.ok(comentarioService.getComments(cursoId, cycle, schedule));
    }

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(@PathVariable Long cursoId,
                                                           @RequestHeader("X-User-Id") Long userId,
                                                           @RequestBody CreateCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(comentarioService.createComment(cursoId, userId, request));
    }

    @PostMapping("/{commentId}/replies")
    public ResponseEntity<CommentResponse> createReply(@PathVariable Long cursoId, @PathVariable Long commentId,
                                                         @RequestHeader("X-User-Id") Long userId,
                                                         @RequestBody ReplyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(comentarioService.createReply(cursoId, commentId, userId, request));
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<CommentResponse> likeComment(@PathVariable Long cursoId, @PathVariable Long commentId,
                                                         @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(comentarioService.toggleLike(commentId, userId));
    }

    @PostMapping("/{commentId}/replies/{replyId}/like")
    public ResponseEntity<CommentResponse> likeReply(@PathVariable Long cursoId, @PathVariable Long commentId,
                                                       @PathVariable Long replyId, @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(comentarioService.toggleLike(replyId, userId));
    }

    @PostMapping("/{commentId}/dislike")
    public ResponseEntity<CommentResponse> dislikeComment(@PathVariable Long cursoId, @PathVariable Long commentId,
                                                            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(comentarioService.toggleDislike(commentId, userId));
    }

    @PostMapping("/{commentId}/replies/{replyId}/dislike")
    public ResponseEntity<CommentResponse> dislikeReply(@PathVariable Long cursoId, @PathVariable Long commentId,
                                                          @PathVariable Long replyId, @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(comentarioService.toggleDislike(replyId, userId));
    }

    @PostMapping("/{commentId}/report")
    public ResponseEntity<Void> reportComment(@PathVariable Long cursoId, @PathVariable Long commentId,
                                               @RequestHeader("X-User-Id") Long userId, @RequestBody ReportRequest request) {
        comentarioService.reportComment(commentId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/{commentId}/replies/{replyId}/report")
    public ResponseEntity<Void> reportReply(@PathVariable Long cursoId, @PathVariable Long commentId, @PathVariable Long replyId,
                                             @RequestHeader("X-User-Id") Long userId, @RequestBody ReportRequest request) {
        comentarioService.reportComment(replyId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
