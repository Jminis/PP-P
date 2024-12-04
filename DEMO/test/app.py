from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# Base URL for ACME server
CSE_BASE_URL = "http://127.0.0.1:8080/cse-in"
WEBAPP_URL = "http://127.0.0.1:5000/"
CONTAINER_PATH = "SafePackage/shock"

# Common heades
COMMON_HEADERS = {
    "X-M2M-Origin": "SafePackage",
    "X-M2M-RVI": "3"
}

HEADERS = {
    **COMMON_HEADERS,
    "Content-Type": "application/json",
    "X-M2M-RI": "r67d8d56"
}

def send_request(method, url, headers=None, data=None):
    """Helper function to send HTTP requests."""
    try:
        response = requests.request(method, url, headers=headers, json=data)
        return {"status": "success", "response": response.text}
    except requests.exceptions.RequestException as e:
        return {"status": "error", "message": str(e)}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/create_ae", methods=["POST"])
def create_ae():
    url = f"{CSE_BASE_URL}"
    headers = {**COMMON_HEADERS, "Content-Type": "application/json;ty=2", "X-M2M-RI": "req-create-ae"}
    data = {
        "m2m:ae": {
            "rn": "SafePackage",
            "api": "Ntest",
            "rr": True,
            "srv": ['4'],
        }
    }
    return jsonify(send_request("POST", url, headers, data))

@app.route("/delete_ae", methods=["POST"])
def delete_ae():
    url = f"{CSE_BASE_URL}/SafePackage"
    headers = {**COMMON_HEADERS, "X-M2M-RI": "req-delete-ae"}
    return jsonify(send_request("DELETE", url, headers))

@app.route("/create_container/<string:container_name>", methods=["POST"])
def create_container(container_name):
    url = f"{CSE_BASE_URL}/SafePackage"
    headers = {**COMMON_HEADERS, "Content-Type": "application/json;ty=3", "X-M2M-RI": f"req-create-container-{container_name}"}
    data = {
        "m2m:cnt": {
            "rn": container_name,
            "mni": 100
        }
    }
    return jsonify(send_request("POST", url, headers, data))

@app.route("/delete_container/<string:container_name>", methods=["POST"])
def delete_container(container_name):
    url = f"{CSE_BASE_URL}/SafePackage/{container_name}"
    headers = {**COMMON_HEADERS, "X-M2M-RI": f"req-delete-container-{container_name}"}
    return jsonify(send_request("DELETE", url, headers))

@app.route("/create_content_instance", methods=["POST"])
def create_content_instance():
    # Get container name and content value from the request payload
    container_name = request.json.get("container_name")
    content_value = request.json.get("con")

    if not container_name or not content_value:
        return jsonify({"status": "error", "message": "Missing container_name or content value"}), 400

    url = f"{CSE_BASE_URL}/SafePackage/{container_name}"
    headers = {**COMMON_HEADERS, "Content-Type": "application/json;ty=4", "X-M2M-RI": f"req-create-cin-{container_name}"}
    data = {
        "m2m:cin": {
            "con": content_value
        }
    }
    return jsonify(send_request("POST", url, headers, data))

@app.route("/create_subscription/<string:container_name>", methods=["POST"])
def create_subscription(container_name):
    url = f"{CSE_BASE_URL}/SafePackage/{container_name}"
    headers = {**COMMON_HEADERS, "Content-Type": "application/json;ty=23", "X-M2M-RI": f"req-create-subscription-{container_name}"}
    data = {
        "m2m:sub": {
            "rn": f"sub_{container_name}",
            "enc": {"net": [3]},
            "nu": ["http://127.0.0.1:5000/notify"],
            "nct": 1
        }
    }
    return jsonify(send_request("POST", url, headers, data))

@app.route("/get_latest_instance", methods=["GET"])
def get_latest_instance():
    """
    Fetch the latest content instance from a specific container.
    """
    url = f"{CSE_BASE_URL}/{CONTAINER_PATH}/la"
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code == 200:
            data = response.json()
            latest_con = data.get("m2m:cin", {}).get("con")  # Extract the 'con' value
            return jsonify({"status": "success", "latest_instance": latest_con}), 200
        else:
            return jsonify({"status": "error", "message": response.text}), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)
