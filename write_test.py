from database.influx_client import write_engine_telemetry


class SensorData:
    rpm = 3850
    temperature = 74
    oil_pressure = 4.2
    vibration = 2.1
    fuel_flow = 28.6
    exhaust_temperature = 612


sensor_data = SensorData()

write_engine_telemetry(sensor_data)

print("Engine telemetry written successfully!")