package com.gamingevents.dto;
import com.gamingevents.entity.Role;
import jakarta.validation.constraints.*;
public final class AuthDtos { private AuthDtos() {}
  public record RegisterRequest(@NotBlank @Size(max=100) String name, @NotBlank @Email @Size(max=255) String email, @NotBlank @Size(min=8,max=72) @Pattern(regexp=".*[A-Z].*", message="password must contain an uppercase letter") @Pattern(regexp=".*[a-z].*", message="password must contain a lowercase letter") @Pattern(regexp=".*\\d.*", message="password must contain a digit") String password, @NotNull Role role, @Size(max=50) String username) {}
  public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
  public record TokenResponse(String accessToken, String tokenType, long expiresIn, String role, String name, String email) {}
  public record CurrentUserResponse(Long id, String name, String email, String role) {}
}
