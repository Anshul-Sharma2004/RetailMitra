package com.khatavani.KhatavaaniAI.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiChatController {

    private final ChatClient chatClient;

    public AiChatController(ChatClient.Builder builder) {
        this.chatClient = builder
                .defaultSystem("Aap Khatavani.ai ke smart retail assistant ho. " +
                        "Shopkeeper se friendly Hinglish/Hindi me baat karo. " +
                        "Stock ya sale query aane par tool call karke accurate database numbers return karo.")
                .build();
    }

    @GetMapping("/chat")
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')") // <- Both roles allowed
    public String chat(@RequestParam String query) {
        return chatClient.prompt()
                .user(query)
                .functions("checkProductStock", "getTodayTotalSales")
                .call()
                .content();
    }
}