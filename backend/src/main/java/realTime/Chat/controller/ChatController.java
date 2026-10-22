package realTime.Chat.controller;

import realTime.Chat.entity.ChatMessage;
import realTime.Chat.entity.Message;
import realTime.Chat.security.CurrentUser;
import realTime.Chat.service.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.security.Principal;

// The sender always comes from the authenticated WebSocket session
// (see StompAuthInterceptor), never from the message body
@Controller
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Receive from /app/chat/{roomId}, save it,
    // then send the saved message to /topic/room/{roomId}
    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable Long roomId, ChatMessage chatMessage, Principal principal) {
        try {
            Message saved = messageService.sendMessage(roomId, CurrentUser.id(principal), chatMessage.getContent());
            messagingTemplate.convertAndSend("/topic/room/" + roomId, saved);
        } catch (RuntimeException e) {
            // Invalid message (empty, too long, not a member) - drop it
            log.debug("Dropped message to room {}: {}", roomId, e.getMessage());
        }
    }

    // Typing indicator: /app/typing/{roomId} -> /topic/typing/{roomId}
    @MessageMapping("/typing/{roomId}")
    @SendTo("/topic/typing/{roomId}")
    public ChatMessage typing(@DestinationVariable String roomId, ChatMessage event, Principal principal) {
        event.setRoomId(roomId);
        event.setSenderId(CurrentUser.id(principal));
        event.setSender(CurrentUser.username(principal));
        event.setContent(null);
        return event;
    }
}
