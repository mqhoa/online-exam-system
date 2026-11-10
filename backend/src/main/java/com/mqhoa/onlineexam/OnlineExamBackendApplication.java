package com.mqhoa.onlineexam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OnlineExamBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(OnlineExamBackendApplication.class, args);
	}

}
