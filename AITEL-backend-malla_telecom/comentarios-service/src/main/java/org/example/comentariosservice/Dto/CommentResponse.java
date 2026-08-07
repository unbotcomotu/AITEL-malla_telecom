package org.example.comentariosservice.Dto;

import java.util.List;

public class CommentResponse {
    private Long id;
    private String author;
    private Long authorId;
    private String content;
    private String timestamp;
    private long likes;
    private long dislikes;
    private List<Long> likedBy;
    private List<Long> dislikedBy;
    private List<CommentResponse> replies;

    public CommentResponse(Long id, String author, Long authorId, String content, String timestamp,
                            long likes, long dislikes, List<Long> likedBy, List<Long> dislikedBy,
                            List<CommentResponse> replies) {
        this.id = id;
        this.author = author;
        this.authorId = authorId;
        this.content = content;
        this.timestamp = timestamp;
        this.likes = likes;
        this.dislikes = dislikes;
        this.likedBy = likedBy;
        this.dislikedBy = dislikedBy;
        this.replies = replies;
    }

    public Long getId() {
        return id;
    }

    public String getAuthor() {
        return author;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public String getContent() {
        return content;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public long getLikes() {
        return likes;
    }

    public long getDislikes() {
        return dislikes;
    }

    public List<Long> getLikedBy() {
        return likedBy;
    }

    public List<Long> getDislikedBy() {
        return dislikedBy;
    }

    public List<CommentResponse> getReplies() {
        return replies;
    }
}
