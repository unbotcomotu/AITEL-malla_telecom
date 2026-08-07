package org.example.semestresservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class SemestresServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(SemestresServiceApplication.class, args);
	}

}
