package realTime.Chat.service;

import realTime.Chat.entity.Message;
import realTime.Chat.entity.Room;
import realTime.Chat.entity.User;
import realTime.Chat.exception.NotFoundException;
import realTime.Chat.repository.MessageRepository;
import realTime.Chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private static final int MAX_LENGTH = 4000;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomService roomService;

    // Save a message from a room member
    public Message sendMessage(Long roomId, Long senderId, String content) {
        if (roomId == null) {
            throw new RuntimeException("Message must be sent to a room!");
        }
        String text = content == null ? "" : content.trim();
        if (text.isEmpty()) {
            throw new RuntimeException("Message cannot be empty!");
        }
        if (text.length() > MAX_LENGTH) {
            throw new RuntimeException("Message is too long (max " + MAX_LENGTH + " characters)!");
        }

        Room room = roomService.getRoomForMember(roomId, senderId);
        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new NotFoundException("User not found!"));

        Message message = new Message();
        message.setRoom(room);
        message.setSender(sender);
        message.setContent(text);
        message.setTimestamp(LocalDateTime.now());
        return messageRepository.save(message);
    }

    // Get a message, if the user is in its room
    public Message getMessageById(Long id, Long userId) {
        Message message = messageRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Message not found!"));
        roomService.requireMember(message.getRoom(), userId);
        return message;
    }

    // Get all messages in a room (oldest first, as a chat shows them)
    public List<Message> getMessagesByRoom(Long roomId, Long userId) {
        Room room = roomService.getRoomForMember(roomId, userId);
        return messageRepository.findByRoomOrderByTimestampAsc(room);
    }
}
