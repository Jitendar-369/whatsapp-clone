package realTime.Chat.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    // Members are left out so every message doesn't carry the whole member list
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    @JsonIgnoreProperties({"members", "description"})
    private Room room;
    
    // Getters
    public Long getId() { return id; }
    public String getContent() { return content; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public User getSender() { return sender; }
    public Room getRoom() { return room; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setContent(String content) { this.content = content; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public void setSender(User sender) { this.sender = sender; }
    public void setRoom(Room room) { this.room = room; }
}
