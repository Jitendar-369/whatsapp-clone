package realTime.Chat.dto;

// The sender is the signed-in user, so it is not part of the request
public record SendMessageRequest(Long roomId, String content) {}
