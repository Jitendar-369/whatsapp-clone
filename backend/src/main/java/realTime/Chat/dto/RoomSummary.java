package realTime.Chat.dto;

import realTime.Chat.entity.Message;
import realTime.Chat.entity.Room;
import realTime.Chat.entity.User;
import java.util.Set;

// A room plus its latest message, for the chat list
public record RoomSummary(Long id, String name, String description, boolean direct,
                          Set<User> members, Message lastMessage) {
    
    public static RoomSummary of(Room room, Message lastMessage) {
        return new RoomSummary(room.getId(), room.getName(), room.getDescription(),
                room.isDirect(), room.getMembers(), lastMessage);
    }
}
