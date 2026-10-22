package realTime.Chat.controller;

import realTime.Chat.dto.SendMessageRequest;
import realTime.Chat.entity.Message;
import realTime.Chat.security.CurrentUser;
import realTime.Chat.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;  // Use SERVICE, not repository

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // GET message by ID
    @GetMapping("/{id}")
    public Message getMessageById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return messageService.getMessageById(id, CurrentUser.id(jwt));
    }

    // POST - Send a message over HTTP (the app normally uses the WebSocket)
    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody SendMessageRequest request, @AuthenticationPrincipal Jwt jwt) {
        Message sent = messageService.sendMessage(request.roomId(), CurrentUser.id(jwt), request.content());
        messagingTemplate.convertAndSend("/topic/room/" + sent.getRoom().getId(), sent);
        return ResponseEntity.status(HttpStatus.CREATED).body(sent);
    }

    // GET messages from a room (oldest first)
    @GetMapping("/room/{roomId}")
    public List<Message> getMessagesByRoom(@PathVariable Long roomId, @AuthenticationPrincipal Jwt jwt) {
        return messageService.getMessagesByRoom(roomId, CurrentUser.id(jwt));
    }
}
