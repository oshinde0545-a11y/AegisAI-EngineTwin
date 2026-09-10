from .schemas import SensorData


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def calculate_health(data: SensorData):

    rpm_score = 100 - min(abs(data.rpm - 3850) / 10, 100)

    temperature_score = 100 - max(data.temperature - 74, 0) * 4

    oil_score = 100 - abs(data.oil_pressure - 4.2) * 25

    vibration_score = 100 - max(data.vibration - 2.1, 0) * 20

    exhaust_score = 100 - max(
        data.exhaust_temperature - 612, 0
    ) * 1.5

    fuel_score = 100 - abs(data.fuel_flow - 28.6) * 2

    scores = {
        "rpm": clamp(rpm_score, 0, 100),
        "temperature": clamp(temperature_score, 0, 100),
        "oil_pressure": clamp(oil_score, 0, 100),
        "vibration": clamp(vibration_score, 0, 100),
        "exhaust_temperature": clamp(exhaust_score, 0, 100),
        "fuel_flow": clamp(fuel_score, 0, 100),
    }

    # Prototype weighting.
    # These weights must eventually be validated using engine/test data.
    health_index = (
        scores["rpm"] * 0.15
        + scores["temperature"] * 0.20
        + scores["oil_pressure"] * 0.20
        + scores["vibration"] * 0.20
        + scores["exhaust_temperature"] * 0.20
        + scores["fuel_flow"] * 0.05
    )

    health_index = round(clamp(health_index, 0, 100), 2)

    if health_index >= 85:
        status = "NORMAL"
        risk = "LOW"

    elif health_index >= 70:
        status = "OBSERVATION"
        risk = "MEDIUM"

    elif health_index >= 50:
        status = "WARNING"
        risk = "HIGH"

    else:
        status = "CRITICAL"
        risk = "CRITICAL"

    return {
        "health_index": health_index,
        "status": status,
        "risk_level": risk,
        "components": {
            key: round(value, 2)
            for key, value in scores.items()
        }
    }