import os

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "SellSync")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sellsync.db")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "True").lower() == "true"
    AUTO_SEED: bool = os.getenv("AUTO_SEED", "True").lower() == "true"

settings = Settings()
