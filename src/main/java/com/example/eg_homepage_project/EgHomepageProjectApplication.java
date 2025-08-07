package com.example.eg_homepage_project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.example.eg_homepage_project.repository.user_repository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class EgHomepageProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(EgHomepageProjectApplication.class, args);
	}

    @Bean
    CommandLineRunner test(user_repository user_repository) {
        return args -> {
        };
    }

}
