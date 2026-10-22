package realTime.Chat.service;

import realTime.Chat.entity.User;
import realTime.Chat.exception.NotFoundException;
import realTime.Chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private static final int MIN_PASSWORD_LENGTH = 6;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register new user
    public User registerUser(User user) {
        if (isBlank(user.getUsername()) || isBlank(user.getEmail()) || isBlank(user.getPassword())) {
            throw new RuntimeException("Username, email and password are required!");
        }
        if (user.getPassword().length() < MIN_PASSWORD_LENGTH) {
            throw new RuntimeException("Password must be at least " + MIN_PASSWORD_LENGTH + " characters!");
        }
        user.setUsername(user.getUsername().trim());
        user.setEmail(user.getEmail().trim());

        // Check if email already exists
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email already exists!");
        }

        // Check if username already exists
        if (userRepository.findByUsername(user.getUsername()) != null) {
            throw new RuntimeException("Username already exists!");
        }

        // Hash password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Save to database
        return userRepository.save(user);
    }

    // Log in with username (or email) and password
    public User login(String usernameOrEmail, String password) {
        if (isBlank(usernameOrEmail) || isBlank(password)) {
            throw new RuntimeException("Username and password are required!");
        }

        User user = userRepository.findByUsername(usernameOrEmail.trim());
        if (user == null) {
            user = userRepository.findByEmail(usernameOrEmail.trim());
        }

        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid username or password!");
        }
        return user;
    }

    // Get user by ID
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("User not found!"));
    }

    // Get user by username
    public User getUserByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new NotFoundException("User not found!");
        }
        return user;
    }

    // Get all users
    public Iterable<User> getAllUsers() {
        return userRepository.findAll();
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
