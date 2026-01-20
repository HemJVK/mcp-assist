from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "Intelligent Automation"

    # Google API Secrets
    google_client_id: str = ""
    google_client_secret: str = ""
    google_project_id: str = ""
    google_refresh_token: str = ""

    # Optional: Path to credentials file if using service account
    google_application_credentials: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

@lru_cache
def get_settings():
    return Settings()
