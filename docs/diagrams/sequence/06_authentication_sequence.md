# Diagram 06 — Authentication Sequence Diagram

This sequence diagram details the full login execution flow, password verification, JWT access token generation, SHA-256 refresh token hashing, and session DB record creation.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant API as Auth Controller
    participant AuthService as AuthService
    participant UserRepo as UserRepository
    participant SessionRepo as SessionRepository
    participant TokenRepo as TokenRepository
    participant DB as PostgreSQL DB

    User->>API: POST /api/v1/auth/login (email, password)
    API->>AuthService: login(LoginRequest)
    AuthService->>UserRepo: findByEmail(email)
    UserRepo->>DB: SELECT * FROM users WHERE email = ?
    DB-->>UserRepo: User Record (passwordHash)
    UserRepo-->>AuthService: User entity

    AuthService->>AuthService: bcrypt.compare(password, passwordHash)
    
    alt Password Mismatch
        AuthService-->>API: Throw 401 Unauthorized ("Invalid email or password")
        API-->>User: HTTP 401 Unauthorized Response
    else Password Match
        AuthService->>SessionRepo: createSession(userId, expiry, device, browser, ip)
        SessionRepo->>DB: INSERT INTO sessions
        DB-->>SessionRepo: Session Entity (sessionId)

        AuthService->>AuthService: generateAccessToken(userId, sessionId) -> JWT (15m)
        AuthService->>AuthService: generateRefreshToken() -> rawRefreshToken (UUID)
        AuthService->>AuthService: hashToken(rawRefreshToken) -> SHA-256 hash

        AuthService->>TokenRepo: createRefreshToken(userId, tokenHash, expiry)
        TokenRepo->>DB: INSERT INTO refresh_tokens
        DB-->>TokenRepo: RefreshToken Record

        AuthService-->>API: AuthResponseData (user, tokens, sessionId)
        API-->>User: HTTP 200 OK (Set cookies & return AccessToken JSON)
    end
```
