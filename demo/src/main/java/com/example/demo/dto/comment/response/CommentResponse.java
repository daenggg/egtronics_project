package com.example.demo.dto.comment.response;

import com.example.demo.model.Comment;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CommentResponse {
    private Long commentId;
    private String nickname;
    private String profilePictureUrl; 
    private String content;
    private int likeCount;
    private String createdDate;

    private String userId;
    @JsonProperty("isMine") // Jackson이 JSON으로 변환 시 "isMine" 필드명을 사용하도록 강제
    private boolean isMine;
    @JsonProperty("isLiked") // isLiked 필드 추가
    private boolean isLiked;
    
    public CommentResponse(Comment comment) {
        this.commentId = comment.getCommentId();
        this.nickname = comment.getUser().getNickname();
        this.content = comment.getContent();
        this.likeCount = comment.getLikeCount();
        this.createdDate = comment.getCreatedDate().toString();
        if (comment.getUser().getProfilePicture() != null && comment.getUser().getProfilePicture().length > 0) {
            this.profilePictureUrl = "/users/" + comment.getUser().getUserId() + "/photo";
        }
        this.userId = comment.getUser().getUserId();
    }
}
