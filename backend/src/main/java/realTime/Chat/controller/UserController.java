package realTime.Chat.controller;

import realTime.Chat.dto.AuthResponse;
import realTime.Chat.dto.LoginRequest;
import realTime.Chat.entity.User;
import realTime.Chat.security.CurrentUser;
import realTime.Chat.security.JwtService;
import realTime.Chat.service.PresenceService;
import realTime.Chat.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;  // Use SERVICE, not repository

    @Autowired
    private PresenceService presenceService;

    @Autowired
    private JwtService jwtService;

    // POST - Register new user (public), returns a login token
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody User user) {
        User registered = userService.registerUser(user);  // Service validates & hashes
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new AuthResponse(jwtService.createToken(registered), registered));
    }

    // POST - Log in (public), returns a login token
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.login(request.username(), request.password());
            return ResponseEntity.ok(new AuthResponse(jwtService.createToken(user), user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // GET the signed-in user
    @GetMapping("/me")
    public User me(@AuthenticationPrincipal Jwt jwt) {
        return userService.getUserById(CurrentUser.id(jwt));
    }

    // GET all users (to start new chats)
    @GetMapping
    public Iterable<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // GET ids of users who are online right now
    @GetMapping("/online")
    public Object getOnlineUsers() {
        return presenceService.getOnlineUserIds();
    }

    // GET user by ID
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // GET user by username
    @GetMapping("/username/{username}")
    public User getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username);
    }
}
