package realTime.Chat.exception;

// Mapped to 404 by ApiExceptionHandler
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) { super(message); }
}
