import os

from dotenv import load_dotenv
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

load_dotenv()

INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")

client = InfluxDBClient(
    url=INFLUXDB_URL,
    token=INFLUXDB_TOKEN,
    org=INFLUXDB_ORG
)

write_api = client.write_api(write_options=SYNCHRONOUS)


def test_connection():
    health = client.health()

    return {
        "status": health.status,
        "version": health.version,
        "message": health.message
    }


def write_engine_telemetry(sensor_data):
    point = (
        Point("engine_telemetry_v2")
        .field("rpm", float(sensor_data.rpm))
        .field("temperature", float(sensor_data.temperature))
        .field("oil_pressure", float(sensor_data.oil_pressure))
        .field("vibration", float(sensor_data.vibration))
        .field("fuel_flow", float(sensor_data.fuel_flow))
        .field("exhaust_temperature", float(sensor_data.exhaust_temperature))
    )

    write_api.write(
        bucket=INFLUXDB_BUCKET,
        org=INFLUXDB_ORG,
        record=point
    )