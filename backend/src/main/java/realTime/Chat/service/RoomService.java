package realTime.Chat.service;

import realTime.Chat.dto.CreateGroupRequest;
import realTime.Chat.dto.RoomSummary;
import realTime.Chat.entity.Room;
import realTime.Chat.entity.User;
import realTime.Chat.exception.ForbiddenException;
import realTime.Chat.exception.NotFoundException;
import realTime.Chat.repository.MessageRepository;
import realTime.Chat.repository.RoomRepository;
import realTime.Chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Create a group with the creator and the chosen members
    public Room createGroup(CreateGroupRequest request, Long creatorId) {
        User creator = userRepository.findById(creatorId)
            .orElseThrow(() -> new NotFoundException("User not found!"));

        String name = request.name() == null ? null : request.name().trim();
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Group name is required!");
        }
        // "dm_" names are reserved for one-to-one chats
        if (name.startsWith("dm_")) {
            throw new RuntimeException("Group names cannot start with dm_");
        }
        if (roomRepository.findByName(name) != null) {
            throw new RuntimeException("A group with this name already exists!");
        }

        Room room = new Room();
        room.setName(name);
        room.setDescription(request.description());
        room.setDirect(false);
        room.setMembers(new HashSet<>());
        room.getMembers().add(creator);
        if (request.memberIds() != null) {
            room.getMembers().addAll(userRepository.findAllByIdIn(request.memberIds()));
        }

        Room created = roomRepository.save(room);
        notifyMembers(created);
        return created;
    }

    // Find the one-to-one chat between two users, creating it on first use
    public Room getOrCreateDirectRoom(Long userA, Long userB) {
        if (userA.equals(userB)) {
            throw new RuntimeException("Cannot start a chat with yourself!");
        }
        String name = "dm_" + Math.min(userA, userB) + "_" + Math.max(userA, userB);
        Room existing = roomRepository.findByName(name);
        if (existing != null) {
            return existing;
        }

        Room room = new Room();
        room.setName(name);
        room.setDirect(true);
        room.setMembers(new HashSet<>(userRepository.findAllByIdIn(List.of(userA, userB))));
        if (room.getMembers().size() != 2) {
            throw new NotFoundException("User not found!");
        }

        Room created = roomRepository.save(room);
        notifyMembers(created);
        return created;
    }

    // Rooms a user belongs to, most recently active first
    public List<RoomSummary> getRoomsForUser(Long userId) {
        return roomRepository.findByMembers_Id(userId).stream()
            .map(room -> RoomSummary.of(room, messageRepository.findTopByRoomOrderByTimestampDesc(room)))
            .sorted(Comparator.comparing(
                (RoomSummary s) -> s.lastMessage() == null ? null : s.lastMessage().getTimestamp(),
                Comparator.nullsLast(Comparator.reverseOrder())))
            .toList();
    }

    // Get a room the user belongs to
    public Room getRoomForMember(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new NotFoundException("Room not found!"));
        requireMember(room, userId);
        return room;
    }

    // Get a room by name, if the user belongs to it
    public Room getRoomByName(String name, Long userId) {
        Room room = roomRepository.findByName(name);
        if (room == null) {
            throw new NotFoundException("Room not found!");
        }
        requireMember(room, userId);
        return room;
    }

    // Add user to a group - only existing members can add people
    public Room addUserToRoom(Long roomId, Long userId, Long requesterId) {
        Room room = getRoomForMember(roomId, requesterId);
        if (room.isDirect()) {
            throw new RuntimeException("Cannot add people to a one-to-one chat!");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found!"));

        room.getMembers().add(user);
        Room updated = roomRepository.save(room);
        notifyMembers(updated);
        return updated;
    }

    public boolean isMember(Long roomId, Long userId) {
        return roomRepository.findById(roomId)
            .map(room -> isMember(room, userId))
            .orElse(false);
    }

    public void requireMember(Room room, Long userId) {
        if (!isMember(room, userId)) {
            throw new ForbiddenException("You are not a member of this room!");
        }
    }

    private boolean isMember(Room room, Long userId) {
        return room.getMembers().stream().anyMatch(m -> m.getId().equals(userId));
    }

    // Tell each member's open clients about a new or changed room
    private void notifyMembers(Room room) {
        RoomSummary summary = RoomSummary.of(room, messageRepository.findTopByRoomOrderByTimestampDesc(room));
        for (User member : room.getMembers()) {
            messagingTemplate.convertAndSend("/topic/user/" + member.getId() + "/rooms", summary);
        }
    }
}
