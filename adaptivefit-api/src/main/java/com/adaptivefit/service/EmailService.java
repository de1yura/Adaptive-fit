package com.adaptivefit.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendVerificationEmail(String email, String token) {
        System.out.println("=== EMAIL VERIFICATION ===");
        System.out.println("To: " + email);
        System.out.println("Verification Token: " + token);
        System.out.println("==========================");
    }

    public void sendPasswordResetEmail(String email, String token) {
        System.out.println("=== PASSWORD RESET ===");
        System.out.println("To: " + email);
        System.out.println("Reset Token: " + token);
        System.out.println("======================");
    }
}
