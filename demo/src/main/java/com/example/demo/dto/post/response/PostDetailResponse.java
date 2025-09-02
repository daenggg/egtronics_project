package com.example.demo.dto.post.response;

import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.dto.comment.response.CommentResponse;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PostDetailResponse {
    private Long postId;
    private String categoryName;
    private String title;
    private String content;
    private String photoUrl; //게시물 사진
    private String nickname;
    private LocalDateTime createdDate;
    private int likeCount;
    private int viewCount;
    private List<CommentResponse> comments; // 이 부분을 추가합니다
    private String authorProfilePictureUrl; //작성자 프로필

    // [추가] 게시글 작성자와 로그인 사용자가 같은지 여부
    @JsonProperty("isMine") // Jackson이 JSON으로 변환 시 "isMine" 필드명을 사용하도록 강제
    private boolean isMine;
    // [추가] 프론트엔드에서 작성자 ID를 사용하기 위한 필드
    private String userId;
}