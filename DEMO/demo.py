from flask import Flask, jsonify
from flask_cors import CORS
import random
import time

app = Flask(__name__)
CORS(app)

# Initial data for the simulation
data = {
    "hub_status": "Package at hub",
    "drone_status": "Idle",
    "door_status": "Locked",
    "temperature": 25.0,
    "shock": False,
    "open_close": "Closed",
    "location": {"lat": 37.7749, "lng": -122.4194},  # Starting location (Hub)
    "destination": {"lat": 37.7849, "lng": -122.4094}  # Destination
}

# Function to simulate drone movement
def simulate_location():
    """Move the drone closer to the destination."""
    if data["drone_status"] == "En route to destination":
        # Calculate small incremental changes
        step = 0.001
        current_lat, current_lng = data["location"]["lat"], data["location"]["lng"]
        dest_lat, dest_lng = data["destination"]["lat"], data["destination"]["lng"]

        # Update latitude
        if abs(current_lat - dest_lat) > step:
            data["location"]["lat"] += step if dest_lat > current_lat else -step
        else:
            data["location"]["lat"] = dest_lat

        # Update longitude
        if abs(current_lng - dest_lng) > step:
            data["location"]["lng"] += step if dest_lng > current_lng else -step
        else:
            data["location"]["lng"] = dest_lng

        # Check if the drone has reached the destination
        if (
            abs(data["location"]["lat"] - dest_lat) < step
            and abs(data["location"]["lng"] - dest_lng) < step
        ):
            data["location"]["lat"] = dest_lat
            data["location"]["lng"] = dest_lng
            data["hub_status"] = "Package delivered"
            data["drone_status"] = "Idle"

# Function to simulate other sensors
def simulate_sensors():
    """Simulate random updates to other sensors."""
    data["temperature"] += random.uniform(-0.5, 0.5)
    data["temperature"] = max(20.0, min(data["temperature"], 30.0))  # Keep within range
    data["shock"] = random.choice([True, False])  # Random shock events
    data["open_close"] = random.choice(["Open", "Closed"])  # Random door status

@app.route("/sensor-data", methods=["GET"])
def get_sensor_data():
    """Fetch sensor data and update location."""
    simulate_location()
    simulate_sensors()
    return jsonify(data)

@app.route("/start-delivery", methods=["POST"])
def start_delivery():
    """Start the delivery process."""
    data["hub_status"] = "Package in transit"
    data["drone_status"] = "En route to destination"
    return jsonify({"message": "Delivery started", "data": data})

if __name__ == "__main__":
    print("Starting simulation server... Visit http://localhost:5000/sensor-data")
    app.run(debug=True, port=5000)
