from app.simulator import simulator
from database.influx_client import write_engine_telemetry


data = simulator.generate()

print("Generated engine data:")
print(data)

write_engine_telemetry(data)

print("Telemetry successfully written to InfluxDB!")