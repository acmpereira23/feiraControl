package com.feiracontrol.backend.infrastructure.auth.token;

import com.feiracontrol.backend.application.auth.token.TokenIssuer;
import com.feiracontrol.backend.application.auth.token.TokenPayload;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenIssuer implements TokenIssuer {

    private final JwtEncoder jwtEncoder;
    private final long expiresInSeconds;

    public JwtTokenIssuer(
        JwtEncoder jwtEncoder,
        @Value("${app.auth.jwt.expiration-seconds}") long expiresInSeconds
    ) {
        this.jwtEncoder = jwtEncoder;
        this.expiresInSeconds = expiresInSeconds;
    }

    @Override
    public String issue(TokenPayload payload) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusSeconds(expiresInSeconds);

        JwtClaimsSet claims = JwtClaimsSet.builder()
            .subject(payload.subject())
            .issuedAt(issuedAt)
            .expiresAt(expiresAt)
            .claim("user_id", payload.userId().toString())
            .claim("authorities", payload.authorities())
            .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(org.springframework.security.oauth2.jwt.JwtEncoderParameters.from(header, claims))
            .getTokenValue();
    }

    @Override
    public long expiresInSeconds() {
        return expiresInSeconds;
    }
}
