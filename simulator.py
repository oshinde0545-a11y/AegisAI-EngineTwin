import random
import math
from .schemas import SensorData


class EngineSimulator:

    def __init__(self):
        self.time = 0
        self.fault_mode = False

    def set_fault_mode(self, enabled: bool):
        self.fault_mode = enabled

    def generate(self) -> SensorData:
        self.time += 1

        wave = math.sin(self.time / 5)

        rpm = 3850 + wave * 70 + random.uniform(-35, 35)
        temperature = 74 + wave * 1.5 + random.uniform(-0.8, 0.8)
        oil_pressure = 4.2 + random.uniform(-0.08, 0.08)
        vibration = 2.1 + random.uniform(-0.12, 0.12)
        fuel_flow = 28.6 + random.uniform(-0.4, 0.4)
        exhaust_temperature = 612 + wave * 4 + random.uniform(-3, 3)

        # Controlled abnormal condition for demonstration
        if self.fault_mode:
            temperature += 12
            oil_pressure -= 0.8
            vibration += 1.2
            exhaust_temperature += 45

        return SensorData(
            rpm=round(rpm, 2),
            temperature=round(temperature, 2),
            oil_pressure=round(oil_pressure, 2),
            vibration=round(vibration, 2),
            fuel_flow=round(fuel_flow, 2),
            exhaust_temperature=round(exhaust_temperature, 2),
        )


simulator = EngineSimulator()