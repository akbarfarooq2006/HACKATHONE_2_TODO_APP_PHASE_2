from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All settings are loaded from .env file in the backend directory.
    """

    # Database Configuration
    DATABASE_URL: str

    # Authentication Configuration
    BETTER_AUTH_SECRET: str

    # Server Configuration (optional)
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True

    # CORS Configuration (optional)
    CORS_ORIGINS: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    def validate_settings(self) -> None:
        """
        Validate critical settings on startup.

        Raises:
            ValueError: If any critical setting is invalid
        """
        # Validate DATABASE_URL format
        if not self.DATABASE_URL.startswith("postgresql://"):
            raise ValueError(
                "DATABASE_URL must start with 'postgresql://'. "
                f"Got: {self.DATABASE_URL[:20]}..."
            )

        # Validate BETTER_AUTH_SECRET length (should be at least 32 chars)
        if len(self.BETTER_AUTH_SECRET) < 32:
            raise ValueError(
                f"BETTER_AUTH_SECRET must be at least 32 characters. "
                f"Got: {len(self.BETTER_AUTH_SECRET)} characters. "
                f"Generate with: openssl rand -base64 32"
            )

    @property
    def cors_origins_list(self) -> list[str]:
        """
        Parse CORS_ORIGINS string into a list of origins.

        Returns:
            List of allowed CORS origins
        """
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Global settings instance
settings = Settings()

# Validate settings on import
settings.validate_settings()
