import requests

# Configuration
CSE_BASE_URL = "http://127.0.0.1:8080/cse-in"
CONTAINER_PATH = "SafePackage2/shock"
HEADERS = {
 "Content-Type": "application/json",
 "X-M2M-Origin": "SafePackage2",
 "X-M2M-RI": "r67d8d56",
 "X-M2M-RVI": "3"
}

# Fetch the latest content instance
def get_latest_instance():
    url = f"{CSE_BASE_URL}/{CONTAINER_PATH}/la"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        return data.get("m2m:cin", {}).get("con")  # Extract the 'con' value
    else:
        print(f"Error: {response.status_code}, {response.text}")
        return None

latest_con = get_latest_instance()
if latest_con:
    print(f"The latest content instance value is: {latest_con}")
