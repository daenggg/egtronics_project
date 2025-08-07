package com.example.eg_homepage_project.repository;

import com.example.eg_homepage_project.Database.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface user_repository extends JpaRepository<Users, Long> {
}
