package realTime.Chat.exception;

// Mapped to 403 by ApiExceptionHandler
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) { super(message); }
}
