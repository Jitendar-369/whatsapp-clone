package realTime.Chat.security;

import realTime.Chat.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

// Issues the signed tokens clients send as "Authorization: Bearer <token>"
@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final long expirationHours;

    public JwtService(JwtEncoder encoder, @Value("${app.jwt.expiration-hours}") long expirationHours) {
        this.encoder = encoder;
        this.expirationHours = expirationHours;
    }

    public String createToken(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer("chat-app")
            .subject(user.getId().toString())
            .claim("username", user.getUsername())
            .issuedAt(now)
            .expiresAt(now.plus(expirationHours, ChronoUnit.HOURS))
            .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
