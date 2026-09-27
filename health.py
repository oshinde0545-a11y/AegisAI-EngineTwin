from fastapi import APIRouter

from ..simulator import simulator
from ..health_engine import calculate_health
from ..anomaly_engine import calculate_anomaly


router = APIRouter(
    prefix="/api/health",
    tags=["Health"]
)


@router.get("/")
def engine_health():

    data = simulator.get_latest()

    if data is None:
        data = simulator.generate()

    health = calculate_health(data)
    anomaly = calculate_anomaly(data)

    return {
        "success": True,
        "sensors": data,
        "health": health,
        "anomaly": anomaly
    }