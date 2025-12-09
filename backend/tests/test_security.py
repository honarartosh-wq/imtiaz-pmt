import pytest
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_account_number
)


class TestPasswordHashing:
    """Test password hashing utilities."""

    def test_password_hashing(self):
        """Test that password is properly hashed."""
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        # Hash should be different from original
        assert hashed != password
        # Hash should be consistent length
        assert len(hashed) > 50

    def test_password_verification(self):
        """Test password verification."""
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        # Correct password should verify
        assert verify_password(password, hashed) is True
        # Wrong password should not verify
        assert verify_password("WrongPassword123!", hashed) is False


class TestJWTTokens:
    """Test JWT token generation and validation."""

    def test_create_access_token(self):
        """Test access token creation."""
        data = {"user_id": 1, "email": "test@example.com", "role": "client"}
        token = create_access_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 50

    def test_create_refresh_token(self):
        """Test refresh token creation."""
        data = {"user_id": 1, "email": "test@example.com"}
        token = create_refresh_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 50

    def test_decode_valid_token(self):
        """Test decoding valid token."""
        data = {"user_id": 1, "email": "test@example.com", "role": "client"}
        token = create_access_token(data)
        decoded = decode_token(token)
        
        assert decoded is not None
        assert decoded["user_id"] == 1
        assert decoded["email"] == "test@example.com"
        assert decoded["type"] == "access"

    def test_decode_invalid_token(self):
        """Test decoding invalid token."""
        decoded = decode_token("invalid.token.here")
        assert decoded is None


class TestAccountNumber:
    """Test account number generation."""

    def test_generate_account_number(self):
        """Test account number generation."""
        account_num = generate_account_number()
        
        assert account_num is not None
        assert account_num.startswith("ACC-")
        assert len(account_num) == 9  # ACC-XXXXX (9 chars)

    def test_account_numbers_unique(self):
        """Test that generated account numbers are unique."""
        numbers = set()
        for _ in range(100):
            num = generate_account_number()
            numbers.add(num)
        
        # Should generate 100 unique numbers
        assert len(numbers) == 100
