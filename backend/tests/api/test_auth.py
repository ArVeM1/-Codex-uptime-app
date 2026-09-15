def registration_payload() -> dict[str, str]:
    return {"email": "User@Example.COM", "name": "Amir", "password": "secure-password"}


def test_healthcheck(client) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_register_creates_session_and_normalizes_email(client) -> None:
    response = client.post("/api/v1/auth/register", json=registration_payload())
    body = response.json()
    assert response.status_code == 201
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["email"] == "user@example.com"
    assert "refresh_token" in response.headers["set-cookie"]
    assert "HttpOnly" in response.headers["set-cookie"]


def test_duplicate_registration_is_rejected(client) -> None:
    client.post("/api/v1/auth/register", json=registration_payload())
    response = client.post("/api/v1/auth/register", json=registration_payload())
    assert response.status_code == 409


def test_login_accepts_valid_password_and_rejects_invalid_password(client) -> None:
    client.post("/api/v1/auth/register", json=registration_payload())
    success = client.post("/api/v1/auth/login", json={"email": "user@example.com", "password": "secure-password"})
    failed = client.post("/api/v1/auth/login", json={"email": "user@example.com", "password": "incorrect-password"})
    assert success.status_code == 200
    assert success.json()["access_token"]
    assert failed.status_code == 401


def test_refresh_rotates_refresh_token_and_rejects_the_old_one(client) -> None:
    client.post("/api/v1/auth/register", json=registration_payload())
    old_token = client.cookies.get("refresh_token")
    refreshed = client.post("/api/v1/auth/refresh")
    assert refreshed.status_code == 200
    assert refreshed.json()["access_token"]
    new_token = client.cookies.get("refresh_token")
    assert new_token != old_token

    replay_client = type(client)(client.app, cookies={"refresh_token": old_token})
    replay = replay_client.post("/api/v1/auth/refresh")
    assert replay.status_code == 401


def test_logout_revokes_current_refresh_session(client) -> None:
    client.post("/api/v1/auth/register", json=registration_payload())
    token = client.cookies.get("refresh_token")
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 204
    assert "refresh_token" in response.headers["set-cookie"]

    replay_client = type(client)(client.app, cookies={"refresh_token": token})
    assert replay_client.post("/api/v1/auth/refresh").status_code == 401


def test_refresh_requires_cookie(client) -> None:
    response = client.post("/api/v1/auth/refresh")
    assert response.status_code == 401


def test_profile_can_be_read_and_name_updated(client) -> None:
    registered = client.post("/api/v1/auth/register", json=registration_payload()).json()
    headers = {"Authorization": f"Bearer {registered['access_token']}"}

    profile = client.get("/api/v1/profile", headers=headers)
    assert profile.status_code == 200
    assert profile.json() == registered["user"]

    updated = client.patch("/api/v1/profile", json={"name": "  Updated name  "}, headers=headers)
    assert updated.status_code == 200
    assert updated.json()["name"] == "Updated name"
    assert client.get("/api/v1/profile", headers=headers).json()["name"] == "Updated name"


def test_profile_requires_access_token(client) -> None:
    assert client.get("/api/v1/profile").status_code == 401


def test_avatar_can_be_uploaded_and_downloaded(client) -> None:
    registered = client.post("/api/v1/auth/register", json=registration_payload()).json()
    headers = {"Authorization": f"Bearer {registered['access_token']}"}
    image = b"\x89PNG\r\n\x1a\nminimal-test-image"

    uploaded = client.post("/api/v1/profile/avatar", headers=headers, files={"file": ("avatar.png", image, "image/png")})

    assert uploaded.status_code == 200
    avatar_url = uploaded.json()["avatar_url"]
    assert avatar_url
    downloaded = client.get(avatar_url)
    assert downloaded.status_code == 200
    assert downloaded.headers["content-type"] == "image/png"
    assert downloaded.content == image


def test_avatar_rejects_unsupported_type(client) -> None:
    registered = client.post("/api/v1/auth/register", json=registration_payload()).json()
    headers = {"Authorization": f"Bearer {registered['access_token']}"}

    response = client.post("/api/v1/profile/avatar", headers=headers, files={"file": ("avatar.gif", b"GIF89a", "image/gif")})

    assert response.status_code == 415
