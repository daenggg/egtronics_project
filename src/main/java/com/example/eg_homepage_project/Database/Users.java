package com.example.eg_homepage_project.Database;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor

public class Users {
    @Id
    @Column(name = "user_id", nullable = false, length = 100, unique = true)
    private String userId;

    @Column(name = "password", nullable = false, length = 64)
    private String password;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "nickname", nullable = false, length = 100)
    private String nickname;

    @Column(name = "authority", nullable = false, length = 100)
    private String authority;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Lob
    @Column(name = "profile_picture")
    private byte[] profilePicture;
}
