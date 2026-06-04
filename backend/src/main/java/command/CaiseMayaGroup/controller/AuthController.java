package command.CaiseMayaGroup.controller;

import command.CaiseMayaGroup.dto.LoginRequest;
import command.CaiseMayaGroup.dto.LoginResponse;
import command.CaiseMayaGroup.entity.User;
import command.CaiseMayaGroup.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401)
                    .body(new LoginResponse(false, "Invalid username or password", null, null));
        }

        User user = userOpt.get();

        // Simple plain-text password check (no hashing for simplicity)
        if (!user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(401)
                    .body(new LoginResponse(false, "Invalid username or password", null, null));
        }

        return ResponseEntity.ok(
                new LoginResponse(true, "Login successful", user.getUsername(), user.getRole())
        );
    }
}
