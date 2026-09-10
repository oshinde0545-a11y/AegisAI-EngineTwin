from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from .config import settings
from .simulator import simulator
from .health_engine import calculate_health
from .anomaly_engine import calculate_anomaly
from .digital_twin import build_digital_twin

from .routes import telemetry
from .routes import health
from .routes import twin


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description=(
        "AegisAI backend for real-time aero-piston "
        "engine health monitoring, anomaly detection "
        "and Digital Twin decision support."
    )
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# API ROUTES
# --------------------------------------------------

app.include_router(telemetry.router)
app.include_router(health.router)
app.include_router(twin.router)


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
def root():

    return {
        "application": "AegisAI",
        "version": settings.version,
        "status": "online",
        "message": "AegisAI Engine Health Backend is running."
    }


# --------------------------------------------------
# SYSTEM HEALTH
# --------------------------------------------------

@app.get("/api/system/status")
def system_status():

    return {
        "system": "AegisAI",
        "status": "ONLINE",
        "timestamp": datetime.now().isoformat(),
        "simulator": True
    }


# --------------------------------------------------
# COMPLETE ENGINE SNAPSHOT
# --------------------------------------------------

@app.get("/api/engine/snapshot")
def engine_snapshot():

    sensor_data = simulator.generate()

    expected_twin = build_digital_twin(sensor_data)

    health = calculate_health(sensor_data)

    anomaly = calculate_anomaly(sensor_data)

    return {
        "timestamp": datetime.now().isoformat(),

        "sensors": sensor_data,

        "expected": expected_twin.expected,

        "residuals": expected_twin.residuals,

        "health": health,

        "anomaly": anomaly,

        "digital_twin": expected_twin,
    }