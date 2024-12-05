from flask import Flask, request, jsonify
import requests
import json
from datetime import datetime, timezone
from flask_cors import CORS  # Enable CORS

app = Flask(__name__)
CORS(app)  # Allow all domains

# ACME server URL for sending commands
ACME_COMMAND_URL = "http://localhost:8081/cse-mn/doorAE/command"
# ACME server URL for fetching location data
ACME_LOCATION_URL = "http://localhost:8080/cse-in/SafePackage/location/la"

@app.route('/send-command', methods=['POST'])
def handle_command():
    # Receive JSON data
    try:
        data = request.get_json()
    except Exception as e:
        return jsonify({"status": "error", "message": "Invalid JSON format"}), 400

    # Extract command
    command_data = data.get('m2m:cin', {}).get('con')
    if not command_data or not isinstance(command_data, dict):
        return jsonify({"status": "error", "message": "Invalid command format"}), 400

    command = command_data.get('command')
    if not command:
        return jsonify({"status": "error", "message": "Command not found"}), 400

    # Handle unlock command
    if command == 'unlocked':
        resource_name = f"command_{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
        payload = {
            "m2m:cin": {
                "rn": resource_name,
                "con": json.dumps({
                    "command": "unlocked",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
            }
        }

        headers = {
            "X-M2M-Origin": "CUserAE",
            "X-M2M-RI": "req-door-command-unlocked",  # Request identifier
            "X-M2M-RVI": "3",
            "Content-Type": "application/json;ty=4",
            "Accept": "application/json",
        }

        try:
            # Send POST request to the ACME server
            response = requests.post(ACME_COMMAND_URL, headers=headers, json=payload)
            if response.status_code == 201:
                return jsonify({"status": "success", "message": "Unlock command executed successfully"}), 201
            else:
                return jsonify({"status": "error", "message": f"ACME server error: {response.text}"}), response.status_code
        except requests.exceptions.RequestException as e:
            return jsonify({"status": "error", "message": f"Error sending to ACME server: {str(e)}"}), 500

    # Handle lock command
    elif command == 'locked':
        resource_name = f"command_{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
        payload = {
            "m2m:cin": {
                "rn": resource_name,
                "con": json.dumps({
                    "command": "locked",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
            }
        }

        headers = {
            "X-M2M-Origin": "CUserAE",
            "X-M2M-RI": "req-door-command-locked",
            "X-M2M-RVI": "3",
            "Content-Type": "application/json;ty=4",
            "Accept": "application/json",
        }

        try:
            # Send POST request to the ACME server
            response = requests.post(ACME_COMMAND_URL, headers=headers, json=payload)
            if response.status_code == 201:
                return jsonify({"status": "success", "message": "Lock command executed successfully"}), 201
            else:
                return jsonify({"status": "error", "message": f"ACME server error: {response.text}"}), response.status_code
        except requests.exceptions.RequestException as e:
            return jsonify({"status": "error", "message": f"Error sending to ACME server: {str(e)}"}), 500

    # Handle unknown commands
    return jsonify({"status": "error", "message": "Unknown command"}), 400


@app.route('/get-location', methods=['GET'])
def get_location():
    headers = {
        'X-M2M-Origin': 'SafePackage',
        'X-M2M-RI': 'req-fetch-location',
        'X-M2M-RVI': '3',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    try:
        # Send request to the ACME server
        response = requests.get(ACME_LOCATION_URL, headers=headers)
        
        print("ACME server response status code:", response.status_code)  # Log status code
        
        if response.status_code == 200:
            # Parse response JSON data
            data = response.json()
            print("ACME server response data:", data)  # Log full response data
            
            # Parse 'con' field JSON string
            location_data = json.loads(data['m2m:cin']['con'])
            print("Parsed location data:", location_data)  # Log parsed location data
            
            # Extract 'latitude' and 'longitude'
            latitude = location_data.get('latitude')
            longitude = location_data.get('longitude')
            
            # Return location to the client
            return jsonify({
                'latitude': latitude,
                'longitude': longitude
            }), 200
        else:
            # Handle server error
            error_message = f"Error fetching location from ACME server: {response.text}"
            print("ACME server error message:", error_message)  # Log error message
            return jsonify({"status": "error", "message": error_message}), response.status_code
    except requests.exceptions.RequestException as e:
        # Handle request exceptions
        error_message = f"Error connecting to ACME server: {str(e)}"
        print(f"Error occurred: {error_message}")  # Log exception message
        return jsonify({"status": "error", "message": error_message}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
