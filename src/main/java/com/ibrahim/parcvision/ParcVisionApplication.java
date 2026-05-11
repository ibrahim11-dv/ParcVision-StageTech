package com.ibrahim.parcvision;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ParcVisionApplication {

    public static void main(String[] args) {
        SpringApplication.run(ParcVisionApplication.class, args);
    }

}
