package realTime.Chat.security;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import java.security.Principal;

// Reads the signed-in user out of a verified token.
// The token subject is the user id (see JwtService).
public final class CurrentUser {

    private CurrentUser() {}

    public static Long id(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }

    public static Long id(Principal principal) {
        return Long.valueOf(principal.getName());
    }

    public static String username(Principal principal) {
        if (principal instanceof JwtAuthenticationToken token) {
            return token.getToken().getClaimAsString("username");
        }
        return null;
    }
}
