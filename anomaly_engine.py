from .schemas import SensorData


NORMAL = {
    "rpm": 3850,
    "temperature": 74,
    "oil_pressure": 4.2,
    "vibration": 2.1,
    "fuel_flow": 28.6,
    "exhaust_temperature": 612,
}


def calculate_anomaly(data: SensorData):

    deviations = {
        "rpm": abs(data.rpm - NORMAL["rpm"]) / 300,
        "temperature": abs(data.temperature - NORMAL["temperature"]) / 15,
        "oil_pressure": abs(data.oil_pressure - NORMAL["oil_pressure"]) / 1.5,
        "vibration": abs(data.vibration - NORMAL["vibration"]) / 3,
        "fuel_flow": abs(data.fuel_flow - NORMAL["fuel_flow"]) / 8,
        "exhaust_temperature": abs(
            data.exhaust_temperature - NORMAL["exhaust_temperature"]
        ) / 80,
    }

    anomaly_score = max(deviations.values())

    anomaly_score = min(anomaly_score, 1.0)

    is_anomaly = anomaly_score >= 0.45

    confidence = 60 + anomaly_score * 40

    if anomaly_score < 0.25:
        severity = "NORMAL"

    elif anomaly_score < 0.45:
        severity = "OBSERVATION"

    elif anomaly_score < 0.70:
        severity = "WARNING"

    else:
        severity = "CRITICAL"

    if is_anomaly:
        message = "Abnormal engine behaviour detected."
    else:
        message = "No significant abnormality detected."

    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": round(anomaly_score, 3),
        "confidence": round(confidence, 2),
        "severity": severity,
        "message": message,
    }