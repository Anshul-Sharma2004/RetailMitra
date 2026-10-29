package com.khatavani.KhatavaaniAI.dto;

import com.khatavani.KhatavaaniAI.model.enums.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String shopName;
    private String phone;
    private Role role;
}