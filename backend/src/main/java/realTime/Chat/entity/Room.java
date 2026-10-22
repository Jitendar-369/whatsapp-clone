package realTime.Chat.entity;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "rooms")
public class Room {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    private String description;
    
    // true = one-to-one chat, false = group
    @Column(name = "is_direct", columnDefinition = "boolean default false")
    private Boolean direct = false;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "room_members",
        joinColumns = @JoinColumn(name = "room_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members;
    
    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public boolean isDirect() { return Boolean.TRUE.equals(direct); }
    public Set<User> getMembers() { return members; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setDirect(boolean direct) { this.direct = direct; }
    public void setMembers(Set<User> members) { this.members = members; }
}
