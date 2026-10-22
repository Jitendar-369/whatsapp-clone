package realTime.Chat.service;

import realTime.Chat.security.CurrentUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import java.security.Principal;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

// Tracks who is online from the user each WebSocket session authenticated as
@Service
public class PresenceService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // WebSocket session id -> user id
    private final Map<String, Long> sessions = new ConcurrentHashMap<>();

    public Set<Long> getOnlineUserIds() {
        return new HashSet<>(sessions.values());
    }

    // Fired after the token was accepted (see StompAuthInterceptor)
    @EventListener
    public void handleConnected(SessionConnectedEvent event) {
        Principal user = event.getUser();
        String sessionId = StompHeaderAccessor.wrap(event.getMessage()).getSessionId();
        if (user != null && sessionId != null) {
            sessions.put(sessionId, CurrentUser.id(user));
            broadcast();
        }
    }

    // Broadcast once the client is listening, so it receives the current list too
    @EventListener
    public void handleSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if ("/topic/presence".equals(accessor.getDestination())) {
            broadcast();
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        if (sessions.remove(event.getSessionId()) != null) {
            broadcast();
        }
    }

    private void broadcast() {
        messagingTemplate.convertAndSend("/topic/presence", getOnlineUserIds());
    }
}
