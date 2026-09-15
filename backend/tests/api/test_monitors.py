def registration_payload(email: str = "user@example.com") -> dict[str, str]:
    return {"email": email, "name": "Amir", "password": "secure-password"}


def auth_headers(client, email: str = "user@example.com") -> dict[str, str]:
    response = client.post("/api/v1/auth/register", json=registration_payload(email))
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def test_monitor_can_be_created_and_listed_for_authenticated_user(client) -> None:
    headers = auth_headers(client)
    created = client.post("/api/v1/monitors", json={"url": "https://example.com", "interval_value": 7, "interval_unit": "seconds"}, headers=headers)

    assert created.status_code == 201
    assert created.json()["url"] == "https://example.com/"
    assert created.json()["interval_value"] == 7
    assert created.json()["interval_unit"] == "seconds"
    assert client.get("/api/v1/monitors", headers=headers).json() == [created.json()]


def test_monitor_frequency_supports_minutes_and_hours(client) -> None:
    headers = auth_headers(client)
    for value, unit in [(1, "minutes"), (2, "hours")]:
        response = client.post("/api/v1/monitors", json={"url": "https://example.com", "interval_value": value, "interval_unit": unit}, headers=headers)
        assert response.status_code == 201
        assert response.json()["interval_unit"] == unit


def test_monitors_require_authentication_and_validate_frequency(client) -> None:
    assert client.get("/api/v1/monitors").status_code == 401
    headers = auth_headers(client)
    invalid_unit = client.post("/api/v1/monitors", json={"url": "https://example.com", "interval_value": 1, "interval_unit": "days"}, headers=headers)
    invalid_value = client.post("/api/v1/monitors", json={"url": "https://example.com", "interval_value": 0, "interval_unit": "minutes"}, headers=headers)
    assert invalid_unit.status_code == 422
    assert invalid_value.status_code == 422
