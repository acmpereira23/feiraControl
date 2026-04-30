package com.feiracontrol.backend.infrastructure.auth.security;

import com.feiracontrol.backend.domain.auth.AuthenticatedUser;
import com.feiracontrol.backend.domain.auth.AuthenticationScheme;
import java.util.Collection;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class JwtAuthenticatedUserConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Set<String> authorities = jwt.getClaimAsStringList("authorities") == null
            ? Set.of()
            : Set.copyOf(jwt.getClaimAsStringList("authorities"));

        Collection<GrantedAuthority> grantedAuthorities = authorities.stream()
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toUnmodifiableSet());

        AuthenticatedUser principal = new AuthenticatedUser(
            UUID.fromString(jwt.getClaimAsString("user_id")),
            jwt.getSubject(),
            authorities,
            AuthenticationScheme.JWT
        );

        return UsernamePasswordAuthenticationToken.authenticated(principal, jwt.getTokenValue(), grantedAuthorities);
    }
}
