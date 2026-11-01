package com.khatavani.KhatavaaniAI.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendUdhaarDueReminder(String toEmail, String customerName, BigDecimal dueAmount, String dueDate) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Khatavani.ai - Payment Reminder: Udhaar Due");
            message.setText("Namaste " + customerName + ",\n\n" +
                    "Aapka dukaan par ₹" + dueAmount + " ka udhaar baaki hai jiski due date " + dueDate + " thi.\n" +
                    "Kripya dukaan par aakar ya UPI ke madhyam se jald se jald payment clear karein.\n\n" +
                    "Dhanyawaad,\nTeam Khatavani");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetOtp(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Khatavani.ai - Password Reset Verification Code");
            message.setText("Namaste Shopkeeper,\n\n" +
                    "Aapke Khatavani.ai account ke password reset ke liye verification OTP hai:\n\n" +
                    "👉  " + otp + "  👈\n\n" +
                    "Yeh OTP agle 10 minute tak valid hai. Agar aapne yeh request nahi ki hai toh kripya is email ko ignore karein.\n\n" +
                    "Team Khatavani.ai Retail OS");
            mailSender.send(message);
            System.out.println("Password reset OTP sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("OTP email send fail hui: " + e.getMessage());
        }
    }
}