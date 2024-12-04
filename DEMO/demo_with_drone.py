import requests
import json
import time
import random
from datetime import datetime, timezone
from flask import Flask, request, jsonify

# ACME server settings
ACME_BASE_URL = "http://localhost:8080/cse-in/SafePackage"  # CSEBase and AE path
DEPARTURE_URL = f"{ACME_BASE_URL}/departures/la"
ARRIVAL_URL = f"{ACME_BASE_URL}/arrivals/la"
SHOCK_URL = f"{ACME_BASE_URL}/Shock"
TEMPERATURE_URL = f"{ACME_BASE_URL}/Temperature"

# Location update interval (seconds)
UPDATE_INTERVAL = 2

# Initialize Flask app
app = Flask(__name__)

HEADERS = {
    "X-M2M-Origin": "SafePackage",
    "X-M2M-RI": "req-drone-resource-data",
    "X-M2M-RVI": "3",
    "Content-Type": "application/json;ty=4",
    "Accept": "application/json",
}


def fetch_location_data(url):
    """Fetch location data from the ACME server."""
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code == 200:
            data = response.json()
            print(f"[{datetime.now()}] Response data: {data}")
            # Parse JSON from the 'con' field
            location_data = json.loads(data["m2m:cin"]["con"])
            return float(location_data["latitude"]), float(location_data["longitude"])
        else:
            print(f"[{datetime.now()}] Error: {response.status_code}, Message: {response.text}")
            raise ValueError(f"Failed to fetch location: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Request exception occurred: {str(e)}")
        raise


def simulate_movement(lat1, lon1, lat2, lon2, step_fraction):
    """Simulate movement using linear interpolation between two coordinates."""
    latitude = lat1 + (lat2 - lat1) * step_fraction
    longitude = lon1 + (lon2 - lon1) * step_fraction
    return latitude, longitude


def send_data(url, resource_name, content):
    """Send data to the ACME server."""
    payload = {
        "m2m:cin": {
            "rn": resource_name,
            "con": str(content),  # Convert to string
        }
    }
    try:
        response = requests.post(url, headers=HEADERS, json=payload)
        if response.status_code == 201:
            print(f"[{datetime.now()}] Data sent successfully: {content}")
        else:
            print(f"[{datetime.now()}] Data sending failed: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] Request exception occurred: {str(e)}")


def send_location_and_sensor_data(resource_name, latitude, longitude, elapsed_time):
    """Send location, shock, and temperature data simultaneously."""

    # Send location information
    location_payload = json.dumps({
        "latitude": f"{latitude:.6f}",
        "longitude": f"{longitude:.6f}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    send_data(f"{ACME_BASE_URL}/location", resource_name, location_payload)

    # Send shock data
    if 16 <= elapsed_time < 18:  # 18초 대에 한 번만 전송
        shock_value = 50.0
    else:
        shock_value = round(random.uniform(5.0, 30.0), 2)
    send_data(SHOCK_URL, f"{resource_name}_shock", shock_value)

    # Send temperature data
    temperature_value = round(random.uniform(10.0, 12.0), 2)
    send_data(TEMPERATURE_URL, f"{resource_name}_temp", temperature_value)


def drone_simulation():
    """Drone movement simulation program."""
    start_time = time.time()  # Start timer
    try:
        # Fetch departure and destination locations
        start_latitude, start_longitude = fetch_location_data(DEPARTURE_URL)
        destination_latitude, destination_longitude = fetch_location_data(ARRIVAL_URL)

        print(f"Departure: {start_latitude}, {start_longitude}")
        print(f"Destination: {destination_latitude}, {destination_longitude}")

        steps = 11  # Number of steps to reach the destination

        for step in range(steps + 1):
            # Calculate movement fraction (increases from 0 to 1)
            step_fraction = step / steps
            current_latitude, current_longitude = simulate_movement(
                start_latitude, start_longitude, destination_latitude, destination_longitude, step_fraction
            )

            # Include current time in the resource name
            resource_name = f"location_{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"

            # Calculate elapsed time since start
            elapsed_time = int(time.time() - start_time)

            # Send location and sensor data
            send_location_and_sensor_data(resource_name, current_latitude, current_longitude, elapsed_time)

            # End simulation upon reaching the destination
            if step == steps:
                print(f"[{datetime.now()}] Drone has arrived at the destination!")
                break

            # Wait until the next update
            time.sleep(UPDATE_INTERVAL)

    except ValueError as e:
        print(f"Failed to fetch location information: {str(e)}")
    except Exception as e:
        print(f"Unexpected error occurred: {str(e)}")


@app.route('/notification', methods=['POST'])
def notification():
    """Endpoint to handle notifications sent by the ACME server."""
    try:
        data = request.json  # Notification data
        print(f"[Notification Received] Data: {data}")

        # Check for 'arrived' status
        content = json.loads(data["m2m:sgn"]["nev"]["rep"]["m2m:cin"]["con"])
        if content.get("status") == "arrived":
            print("[Notification Processed] Status is 'arrived'. Starting drone simulation.")
            drone_simulation()
        else:
            print(f"[Notification Processed] Status is not 'arrived': {content.get('status')}")

        return jsonify({"status": "success"}), 200
    except Exception as e:
        print(f"[Notification Processing Error] {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    # Run Flask server
    app.run(host="127.0.0.1", port=5002)
