package realTime.Chat.dto;

// username field accepts either a username or an email
public record LoginRequest(String username, String password) {}
