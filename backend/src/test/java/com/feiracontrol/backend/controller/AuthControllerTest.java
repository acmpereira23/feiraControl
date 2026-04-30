package com.feiracontrol.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.feiracontrol.backend.application.auth.LoginService;
import com.feiracontrol.backend.application.auth.RegisterService;
import com.feiracontrol.backend.application.auth.SessionService;
import com.feiracontrol.backend.application.auth.result.AuthSessionView;
import com.feiracontrol.backend.application.auth.result.AuthTokenResult;
import com.feiracontrol.backend.config.SecurityConfig;
import com.feiracontrol.backend.controller.auth.AuthController;
import com.feiracontrol.backend.infrastructure.auth.security.JwtAuthenticatedUserConverter;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(SecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RegisterService registerService;

    @MockBean
    private LoginService loginService;

    @MockBean
    private SessionService sessionService;

    @MockBean
    private JwtDecoder jwtDecoder;

    @MockBean
    private JwtAuthenticatedUserConverter jwtAuthenticatedUserConverter;

    @Test
    void shouldRegisterOwnerAccount() throws Exception {
        UUID userId = UUID.randomUUID();

        given(registerService.register(any())).willReturn(new AuthTokenResult(
            "jwt-token",
            "Bearer",
            3600,
            new AuthSessionView(userId, "owner@feira.com", Set.of("OWNER"))
        ));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "fullName": "Owner",
                      "email": "owner@feira.com",
                      "password": "password123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").value("jwt-token"))
            .andExpect(jsonPath("$.session.userId").value(userId.toString()))
            .andExpect(jsonPath("$.session.email").value("owner@feira.com"))
            .andExpect(jsonPath("$.session.authorities[0]").value("OWNER"));
    }

    @Test
    void shouldLoginSuccessfully() throws Exception {
        UUID userId = UUID.randomUUID();

        given(loginService.login(any())).willReturn(new AuthTokenResult(
            "jwt-token",
            "Bearer",
            3600,
            new AuthSessionView(userId, "owner@feira.com", Set.of("OWNER"))
        ));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "owner@feira.com",
                      "password": "password123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").value("jwt-token"))
            .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    void shouldReturnCurrentSession() throws Exception {
        UUID userId = UUID.randomUUID();

        given(sessionService.currentSession()).willReturn(
            new AuthSessionView(userId, "owner@feira.com", Set.of("OWNER"))
        );

        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").value(userId.toString()))
            .andExpect(jsonPath("$.email").value("owner@feira.com"));
    }

    @Test
    void shouldRejectInvalidRegisterPayload() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "fullName": "",
                      "email": "invalid",
                      "password": "123"
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Validation error"));
    }
}
