package com.gamingevents.config;

import com.gamingevents.repository.UserRepository;
import com.gamingevents.security.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.http.HttpMethod;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Configuration @EnableMethodSecurity
public class SecurityConfig {
  @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
  @Bean SecurityFilterChain chain(HttpSecurity http, JwtService jwt, UserRepository users) throws Exception {
    return http.csrf(c -> c.disable()).cors(cors -> cors.configurationSource(request -> { var configuration = new CorsConfiguration(); configuration.setAllowedOrigins(java.util.List.of("http://localhost:5173")); configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); configuration.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type")); return configuration; })).sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(a -> a.requestMatchers("/api/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll().requestMatchers(HttpMethod.GET, "/api/tournaments/**").permitAll().anyRequest().authenticated())
      .addFilterBefore(new JwtFilter(jwt, users), UsernamePasswordAuthenticationFilter.class).build();
  }
  static class JwtFilter extends OncePerRequestFilter {
    final JwtService jwt; final UserRepository users;
    JwtFilter(JwtService jwt, UserRepository users) { this.jwt=jwt; this.users=users; }
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
      String header=request.getHeader("Authorization");
      if (header != null && header.startsWith("Bearer ")) try { var user=users.findByEmail(jwt.email(header.substring(7))).orElseThrow(); if(user.isEnabled()){ var auth=new UsernamePasswordAuthenticationToken(user.getEmail(), null, java.util.List.of(new SimpleGrantedAuthority("ROLE_"+user.getRole()))); org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth); } } catch (Exception ignored) { }
      chain.doFilter(request,response);
    }
  }
}
