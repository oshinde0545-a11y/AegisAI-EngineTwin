from .schemas import (
    SensorData,
    ExpectedValues,
    Residuals,
    DigitalTwinResult,
)


def expected_engine_state(data: SensorData) -> ExpectedValues:

    # Prototype expected-state model.
    # Replace with a validated physics/engineering model later.

    expected_rpm = 3800

    expected_temperature = 72

    expected_oil_pressure = 4.0

    expected_vibration = 2.0

    expected_fuel_flow = 28.0

    expected_exhaust_temperature = 600

    return ExpectedValues(
        rpm=expected_rpm,
        temperature=expected_temperature,
        oil_pressure=expected_oil_pressure,
        vibration=expected_vibration,
        fuel_flow=expected_fuel_flow,
        exhaust_temperature=expected_exhaust_temperature,
    )


def calculate_residual(
    actual: SensorData,
    expected: ExpectedValues
) -> Residuals:

    return Residuals(
        rpm=round(actual.rpm - expected.rpm, 2),
        temperature=round(
            actual.temperature - expected.temperature, 2
        ),
        oil_pressure=round(
            actual.oil_pressure - expected.oil_pressure, 2
        ),
        vibration=round(
            actual.vibration - expected.vibration, 2
        ),
        fuel_flow=round(
            actual.fuel_flow - expected.fuel_flow, 2
        ),
        exhaust_temperature=round(
            actual.exhaust_temperature
            - expected.exhaust_temperature,
            2,
        ),
    )


def build_digital_twin(data: SensorData):

    expected = expected_engine_state(data)

    residuals = calculate_residual(data, expected)

    residual_magnitude = (
        abs(residuals.temperature)
        + abs(residuals.oil_pressure) * 10
        + abs(residuals.vibration) * 5
        + abs(residuals.exhaust_temperature) * 0.2
    )

    synchronized = residual_magnitude < 25

    if synchronized:
        state = "SYNCHRONIZED"
    elif residual_magnitude < 50:
        state = "DEVIATION"
    else:
        state = "SIGNIFICANT_DEVIATION"

    return DigitalTwinResult(
        synchronized=synchronized,
        actual=data,
        expected=expected,
        residuals=residuals,
        model_state=state,
    )