from flask import Flask, request, jsonify
import requests
import json
from datetime import datetime, timezone
from flask_cors import CORS  # CORS 추가

app = Flask(__name__)
CORS(app)  # 모든 도메인 허용

# ACME 서버 URL (명령을 보내는 URL)
ACME_COMMAND_URL = "http://localhost:8081/cse-mn/doorAE/command"
# ACME 서버 URL (위치 정보 요청 URL)
ACME_LOCATION_URL = "http://localhost:8080/cse-in/SafePackage/location/la"

@app.route('/send-command', methods=['POST'])
def handle_command():
    # JSON 데이터 받기
    try:
        data = request.get_json()
    except Exception as e:
        return jsonify({"status": "error", "message": "Invalid JSON format"}), 400

    # 명령 추출
    command_data = data.get('m2m:cin', {}).get('con')
    if not command_data or not isinstance(command_data, dict):
        return jsonify({"status": "error", "message": "Invalid command format"}), 400

    command = command_data.get('command')
    if not command:
        return jsonify({"status": "error", "message": "Command not found"}), 400

    # Unlock 명령 처리
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
            "X-M2M-Origin": "CdoorAE",
            "X-M2M-RI": "12345",  # 요청 식별자
            "X-M2M-RVI": "3",
            "Content-Type": "application/json;ty=4",
            "Accept": "application/json",
        }

        try:
            # ACME 서버로 POST 요청
            response = requests.post(ACME_COMMAND_URL, headers=headers, json=payload)
            if response.status_code == 201:
                return jsonify({"status": "success", "message": "Unlock command executed successfully"}), 201
            else:
                return jsonify({"status": "error", "message": f"ACME server error: {response.text}"}), response.status_code
        except requests.exceptions.RequestException as e:
            return jsonify({"status": "error", "message": f"Error sending to ACME server: {str(e)}"}), 500

    # Lock 명령 처리
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
            "X-M2M-Origin": "CdoorAE",
            "X-M2M-RI": "12345",  # 요청 식별자
            "X-M2M-RVI": "3",
            "Content-Type": "application/json;ty=4",
            "Accept": "application/json",
        }

        try:
            # ACME 서버로 POST 요청
            response = requests.post(ACME_COMMAND_URL, headers=headers, json=payload)
            if response.status_code == 201:
                return jsonify({"status": "success", "message": "Lock command executed successfully"}), 201
            else:
                return jsonify({"status": "error", "message": f"ACME server error: {response.text}"}), response.status_code
        except requests.exceptions.RequestException as e:
            return jsonify({"status": "error", "message": f"Error sending to ACME server: {str(e)}"}), 500

    # 알 수 없는 명령 처리
    return jsonify({"status": "error", "message": "Unknown command"}), 400


@app.route('/get-location', methods=['GET'])
def get_location():
    headers = {
        'X-M2M-Origin': 'SafePackage',
        'X-M2M-RI': '12345',
        'X-M2M-RVI': '3',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    try:
        # ACME 서버로 요청을 보냄
        response = requests.get(ACME_LOCATION_URL, headers=headers)
        
        print("ACME 서버 응답 상태 코드:", response.status_code)  # 상태 코드 출력
        
        if response.status_code == 200:
            # 응답 데이터 JSON 파싱
            data = response.json()
            print("ACME 서버 응답 데이터:", data)  # 전체 응답 데이터 출력
            
            # 'con' 필드에서 문자열로 된 JSON 데이터를 다시 파싱
            location_data = json.loads(data['m2m:cin']['con'])
            print("파싱된 위치 데이터:", location_data)  # 위치 데이터 출력
            
            # 'latitude'와 'longitude' 값을 추출
            latitude = location_data.get('latitude')
            longitude = location_data.get('longitude')
            
            # 위치 정보를 클라이언트로 반환
            return jsonify({
                'latitude': latitude,
                'longitude': longitude
            }), 200
        else:
            # 에러가 발생한 경우
            error_message = f"Error fetching location from ACME server: {response.text}"
            print("ACME 서버 오류 메시지:", error_message)  # 오류 메시지 출력
            return jsonify({"status": "error", "message": error_message}), response.status_code
    except requests.exceptions.RequestException as e:
        # 요청 예외 처리
        error_message = f"Error connecting to ACME server: {str(e)}"
        print(f"에러 발생: {error_message}")  # 예외 메시지 출력
        return jsonify({"status": "error", "message": error_message}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)  # Flask 서버 실행
