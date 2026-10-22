package realTime.Chat.dto;

import java.util.List;

// The creator is the signed-in user, so it is not part of the request
public record CreateGroupRequest(String name, String description, List<Long> memberIds) {}
