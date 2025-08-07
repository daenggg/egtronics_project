package com.example.eg_homepage_project.Database;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "comment_likes")
@Getter
@Setter
@NoArgsConstructor

public class Comment_likes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_like_id")
    private Long commentLikeId;

    @Column(name = "user_id", nullable = false, length = 100, insertable = false, updatable = false)
    private String userId;

    @Column(name = "comment_id", nullable = false, insertable = false, updatable = false)
    private Long commentId;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", insertable = false, updatable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "comment_id", referencedColumnName = "comment_id", insertable = false, updatable = false)
    private Comments comment;
}
