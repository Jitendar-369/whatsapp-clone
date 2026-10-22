package realTime.Chat.controller;

import realTime.Chat.dto.CreateGroupRequest;
import realTime.Chat.dto.RoomSummary;
import realTime.Chat.entity.Room;
import realTime.Chat.security.CurrentUser;
import realTime.Chat.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// Every endpoint acts as the signed-in user taken from the token,
// and only returns rooms that user belongs to
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;  // Use SERVICE, not repository

    // GET my rooms, each with its latest message
    @GetMapping
    public List<RoomSummary> getMyRooms(@AuthenticationPrincipal Jwt jwt) {
        return roomService.getRoomsForUser(CurrentUser.id(jwt));
    }

    // GET room by ID
    @GetMapping("/{id}")
    public Room getRoomById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return roomService.getRoomForMember(id, CurrentUser.id(jwt));
    }

    // POST - Create a group with members
    @PostMapping("/group")
    public ResponseEntity<Room> createGroup(@RequestBody CreateGroupRequest request, @AuthenticationPrincipal Jwt jwt) {
        Room created = roomService.createGroup(request, CurrentUser.id(jwt));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // POST - Open (or create) my one-to-one chat with another user
    @PostMapping("/direct/{otherUserId}")
    public Room getOrCreateDirect(@PathVariable Long otherUserId, @AuthenticationPrincipal Jwt jwt) {
        return roomService.getOrCreateDirectRoom(CurrentUser.id(jwt), otherUserId);
    }

    // GET room by name
    @GetMapping("/name/{name}")
    public Room getRoomByName(@PathVariable String name, @AuthenticationPrincipal Jwt jwt) {
        return roomService.getRoomByName(name, CurrentUser.id(jwt));
    }

    // POST - Add user to a group I am in
    @PostMapping("/{roomId}/add-user/{userId}")
    public Room addUserToRoom(
            @PathVariable Long roomId,
            @PathVariable Long userId,
            @AuthenticationPrincipal Jwt jwt) {
        return roomService.addUserToRoom(roomId, userId, CurrentUser.id(jwt));
    }
}
