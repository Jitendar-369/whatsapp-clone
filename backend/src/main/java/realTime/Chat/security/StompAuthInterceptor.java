package realTime.Chat.security;

import realTime.Chat.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import java.security.Principal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// Secures the WebSocket: the token is checked on CONNECT, and each
// SUBSCRIBE is only allowed for the user's own rooms and own topics
@Component
public class StompAuthInterceptor implements ChannelInterceptor {

    private static final Pattern ROOM_TOPIC = Pattern.compile("^/topic/(room|typing)/(\\d+)$");
    private static final Pattern USER_TOPIC = Pattern.compile("^/topic/user/(\\d+)/rooms$");

    @Autowired
    private JwtDecoder jwtDecoder;

    // Lazy: RoomService needs the messaging template, which is built from this config
    @Autowired
    @Lazy
    private RoomService roomService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        switch (accessor.getCommand()) {
            case CONNECT -> accessor.setUser(authenticate(accessor.getFirstNativeHeader("Authorization")));
            case SUBSCRIBE -> checkSubscription(requireUser(accessor), accessor.getDestination());
            case SEND -> requireUser(accessor);
            default -> { }
        }
        return message;
    }

    private Principal authenticate(String header) {
        if (header == null || !header.startsWith("Bearer ")) {
            throw new MessageDeliveryException("Missing token");
        }
        try {
            Jwt jwt = jwtDecoder.decode(header.substring("Bearer ".length()));
            return new JwtAuthenticationToken(jwt);
        } catch (JwtException e) {
            throw new MessageDeliveryException("Invalid token");
        }
    }

    private Principal requireUser(StompHeaderAccessor accessor) {
        Principal user = accessor.getUser();
        if (user == null) {
            throw new MessageDeliveryException("Not authenticated");
        }
        return user;
    }

    private void checkSubscription(Principal user, String destination) {
        if (destination == null) {
            throw new MessageDeliveryException("No destination");
        }
        Long userId = CurrentUser.id(user);

        if ("/topic/presence".equals(destination)) {
            return;
        }
        Matcher room = ROOM_TOPIC.matcher(destination);
        if (room.matches()) {
            if (!roomService.isMember(Long.valueOf(room.group(2)), userId)) {
                throw new MessageDeliveryException("Not a member of this room");
            }
            return;
        }
        Matcher own = USER_TOPIC.matcher(destination);
        if (own.matches() && Long.valueOf(own.group(1)).equals(userId)) {
            return;
        }
        throw new MessageDeliveryException("Subscription not allowed: " + destination);
    }
}
