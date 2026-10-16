package com.secureblog.backend.dto;

public record PostResponse(Long id, String title, String content, String author) {
}
