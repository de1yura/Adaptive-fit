package com.adaptivefit;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(info = @Info(
        title = "AdaptiveFit API",
        description = "Personalised adaptive fitness & nutrition platform",
        version = "1.0"
))
public class AdaptiveFitApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdaptiveFitApplication.class, args);
    }
}
