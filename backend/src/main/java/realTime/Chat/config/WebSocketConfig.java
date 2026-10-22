package realTime.Chat.config;

import realTime.Chat.security.StompAuthInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private StompAuthInterceptor stompAuthInterceptor;

    // Same sites as the REST API (app.cors.allowed-origins / CORS_ORIGINS)
    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Messages going TO clients start with /topic
        config.enableSimpleBroker("/topic");

        // Messages coming FROM clients start with /app
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Plain WebSocket endpoint - the React app connects here (ws://localhost:8080/ws)
        registry.addEndpoint("/ws").setAllowedOriginPatterns(allowedOrigins);

        // SockJS fallback endpoint for clients that need it
        registry.addEndpoint("/ws-chat").setAllowedOriginPatterns(allowedOrigins).withSockJS();
    }

    // Check the login token and room membership on incoming STOMP frames
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompAuthInterceptor);
    }
}
