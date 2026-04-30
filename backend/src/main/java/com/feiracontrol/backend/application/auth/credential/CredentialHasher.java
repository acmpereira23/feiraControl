package com.feiracontrol.backend.application.auth.credential;

public interface CredentialHasher {

    String hash(String rawSecret);

    boolean matches(String rawSecret, String hashedSecret);
}
