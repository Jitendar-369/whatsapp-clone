package realTime.Chat.dto;

import realTime.Chat.entity.User;

// Returned by login and register: the signed token plus the user it belongs to
public record AuthResponse(String token, User user) {}
