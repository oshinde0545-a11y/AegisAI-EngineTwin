from pydantic import BaseModel, Field
from typing import Optional


class SensorData(BaseModel):
    rpm: float = Field(..., ge=0)
    temperature: float
    oil_pressure: float
    vibration: float
    fuel_flow: float
    exhaust_temperature: float


class ExpectedValues(BaseModel):
    rpm: float
    temperature: float
    oil_pressure: float
    vibration: float
    fuel_flow: float
    exhaust_temperature: float


class Residuals(BaseModel):
    rpm: float
    temperature: float
    oil_pressure: float
    vibration: float
    fuel_flow: float
    exhaust_temperature: float


class AnomalyResult(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    confidence: float
    severity: str
    message: str


class HealthResult(BaseModel):
    health_index: float
    status: str
    risk_level: str
    components: dict


class DigitalTwinResult(BaseModel):
    synchronized: bool
    actual: SensorData
    expected: ExpectedValues
    residuals: Residuals
    model_state: str


class EngineSnapshot(BaseModel):
    timestamp: str
    sensors: SensorData
    expected: ExpectedValues
    residuals: Residuals
    anomaly: AnomalyResult
    health: HealthResult
    digital_twin: DigitalTwinResult


class MissionStatus(BaseModel):
    mission_name: str
    phase: str
    phase_number: int
    total_phases: int
    altitude_ft: float
    duration_minutes: float