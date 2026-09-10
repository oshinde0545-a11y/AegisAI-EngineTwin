from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "AegisAI Backend"
    version: str = "1.0.0"

    host: str = "127.0.0.1"
    port: int = 8000

    # Demo refresh rate
    simulator_interval: float = 1.0


settings = Settings()