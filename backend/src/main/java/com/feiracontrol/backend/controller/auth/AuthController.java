package com.feiracontrol.backend.controller.auth;

import com.feiracontrol.backend.application.auth.LoginService;
import com.feiracontrol.backend.application.auth.RegisterService;
import com.feiracontrol.backend.application.auth.SessionService;
import com.feiracontrol.backend.application.auth.command.LoginCommand;
import com.feiracontrol.backend.application.auth.command.RegisterCommand;
import com.feiracontrol.backend.application.auth.result.AuthSessionView;
import com.feiracontrol.backend.application.auth.result.AuthTokenResult;
import com.feiracontrol.backend.controller.auth.dto.AuthResponse;
import com.feiracontrol.backend.controller.auth.dto.LoginRequest;
import com.feiracontrol.backend.controller.auth.dto.RegisterRequest;
import com.feiracontrol.backend.controller.auth.dto.SessionResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegisterService registerService;
    private final LoginService loginService;
    private final SessionService sessionService;

    public AuthController(
        RegisterService registerService,
        LoginService loginService,
        SessionService sessionService
    ) {
        this.registerService = registerService;
        this.loginService = loginService;
        this.sessionService = sessionService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return toResponse(registerService.register(new RegisterCommand(
            request.fullName(),
            request.email(),
            request.password()
        )));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return toResponse(loginService.login(new LoginCommand(request.email(), request.password())));
    }

    @GetMapping("/me")
    public SessionResponse me() {
        return toSessionResponse(sessionService.currentSession());
    }

    private AuthResponse toResponse(AuthTokenResult result) {
        return new AuthResponse(
            result.accessToken(),
            result.tokenType(),
            result.expiresInSeconds(),
            toSessionResponse(result.session())
        );
    }

    private SessionResponse toSessionResponse(AuthSessionView session) {
        return new SessionResponse(
            session.userId(),
            session.email(),
            session.authorities()
        );
    }
}
