package realTime.Chat.entity;

// Payload clients send over STOMP (chat messages and typing events)
public class ChatMessage {
    
    private String content;
    private String sender;
    private Long senderId;
    private String roomId;
    private String timestamp;
    private boolean typing;
    
    // Getters
    public String getContent() { return content; }
    public String getSender() { return sender; }
    public Long getSenderId() { return senderId; }
    public String getRoomId() { return roomId; }
    public String getTimestamp() { return timestamp; }
    public boolean isTyping() { return typing; }
    
    // Setters
    public void setContent(String content) { this.content = content; }
    public void setSender(String sender) { this.sender = sender; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public void setTyping(boolean typing) { this.typing = typing; }
}
