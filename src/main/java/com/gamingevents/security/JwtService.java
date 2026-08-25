package com.gamingevents.security;
import com.gamingevents.entity.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service public class JwtService {
  private final byte[] key; private final long expiration;
  public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-ms}") long expiration) {
    if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) throw new IllegalStateException("JWT_SECRET must contain at least 32 bytes");
    this.key=secret.getBytes(StandardCharsets.UTF_8); this.expiration=expiration;
  }
  public String create(String email, Role role) { return Jwts.builder().subject(email).claim("role", role.name()).issuedAt(new Date()).expiration(new Date(System.currentTimeMillis()+expiration)).signWith(Keys.hmacShaKeyFor(key)).compact(); }
  public Claims claims(String token) { return Jwts.parser().verifyWith(Keys.hmacShaKeyFor(key)).build().parseSignedClaims(token).getPayload(); }
  public String email(String token) { return claims(token).getSubject(); }
  public long expirationSeconds() { return expiration / 1000; }
}
