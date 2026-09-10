from fastapi import APIRouter

from ..simulator import simulator
from ..digital_twin import build_digital_twin


router = APIRouter(
    prefix="/api/twin",
    tags=["Digital Twin"]
)


@router.get("/")
def digital_twin():

    data = simulator.generate()

    twin = build_digital_twin(data)

    return {
        "success": True,
        "digital_twin": twin
    }
