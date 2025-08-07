package com.example.eg_homepage_project.Database;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor

public class Notifications {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @Column(name = "user_id", nullable = false, length = 100, insertable = false, updatable = false)
    private String userId;

    @Column(name = "post_id", nullable = false, insertable = false, updatable = false)
    private Long postId;

    @Column(name = "comment_id", nullable = false, insertable = false, updatable = false)
    private Long commentId;

    @Column(name = "post_like_id", nullable = false, insertable = false, updatable = false)
    private Long postLikeId;

    @Column(name = "comment_like_id", nullable = false, insertable = false, updatable = false)
    private Long commentLikeId;

    @Column(name = "message", nullable = false, length = 255)
    private String message;

    @Column(name = "read", nullable = false)
    private boolean read;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", insertable = false, updatable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "post_id", referencedColumnName = "post_id", insertable = false, updatable = false)
    private Posts post;

    @ManyToOne
    @JoinColumn(name = "comment_id", referencedColumnName = "comment_id", insertable = false, updatable = false)
    private Comments comment;

    @ManyToOne
    @JoinColumn(name = "post_like_id", referencedColumnName = "post_like_id", insertable = false, updatable = false)
    private Post_likes postLike;

    @ManyToOne
    @JoinColumn(name = "comment_like_id", referencedColumnName = "comment_like_id", insertable = false, updatable = false)
    private Comment_likes commentLike;
}
