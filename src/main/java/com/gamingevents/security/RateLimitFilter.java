package com.gamingevents.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register")) {
            String clientIp = getClientIp(request);
            long currentMinute = System.currentTimeMillis() / 60000;
            String key = clientIp + ":" + currentMinute;

            RequestCounter counter = requestCounts.computeIfAbsent(key, k -> new RequestCounter());
            if (counter.count.incrementAndGet() > MAX_REQUESTS_PER_MINUTE) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
                return;
            }

            // Cleanup older minutes periodically
            if (requestCounts.size() > 500) {
                requestCounts.keySet().removeIf(k -> {
                    try {
                        long minute = Long.parseLong(k.substring(k.lastIndexOf(':') + 1));
                        return minute < currentMinute - 2;
                    } catch (Exception e) {
                        return true;
                    }
                });
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class RequestCounter {
        final AtomicInteger count = new AtomicInteger(0);
    }
}
