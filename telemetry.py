from fastapi import APIRouter
from ..simulator import simulator

router = APIRouter(
    prefix="/api/telemetry",
    tags=["Telemetry"]
)


@router.get("/current")
def current_telemetry():

    data = simulator.generate()

    return {
        "success": True,
        "data": data
    }


@router.post("/fault/{enabled}")
def set_fault(enabled: bool):

    simulator.set_fault_mode(enabled)

    return {
        "success": True,
        "fault_mode": enabled
    }