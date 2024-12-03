import requests
import json
import time
from datetime import datetime, timezone
from flask import Flask, request, jsonify

# ACME 서버 설정
ACME_BASE_URL = "http://localhost:8080/cse-in/SafePackage"  # CSEBase와 AE 경로
DEPARTURE_URL = f"{ACME_BASE_URL}/departures/la"
ARRIVAL_URL = f"{ACME_BASE_URL}/arrivals/la"

# 위치 업데이트 간격 (초)
UPDATE_INTERVAL = 5  # 5초

# Flask 앱 초기화
app = Flask(__name__)

def fetch_location_data(url):
    """ACME 서버에서 위치 데이터를 가져오는 함수."""
    headers = {
        "X-M2M-Origin": "SafePackage",
        "X-M2M-RI": "12345",
        "X-M2M-RVI": "3",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"[{datetime.now()}] 응답 데이터: {data}")
            # 'con' 필드에서 JSON 파싱
            location_data = json.loads(data["m2m:cin"]["con"])
            return float(location_data["latitude"]), float(location_data["longitude"])
        else:
            print(f"[{datetime.now()}] 에러: {response.status_code}, 메시지: {response.text}")
            raise ValueError(f"Failed to fetch location: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"요청 예외 발생: {str(e)}")
        raise

def simulate_movement(lat1, lon1, lat2, lon2, step_fraction):
    """두 좌표 간 선형 보간법으로 위치 이동 시뮬레이션."""
    latitude = lat1 + (lat2 - lat1) * step_fraction
    longitude = lon1 + (lon2 - lon1) * step_fraction
    return latitude, longitude

def send_data(resource_name, latitude, longitude):
    """ACME 서버로 위치 정보 전송."""
    url = f"{ACME_BASE_URL}/location"  # 컨테이너 경로
    headers = {
        "X-M2M-Origin": "SafePackage",
        "X-M2M-RI": "12345",
        "X-M2M-RVI": "3",
        "Content-Type": "application/json;ty=4",
        "Accept": "application/json",
    }
    payload = {
        "m2m:cin": {
            "rn": resource_name,
            "con": json.dumps({  # JSON 객체를 문자열로 변환
                "latitude": f"{latitude:.6f}",
                "longitude": f"{longitude:.6f}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }),
        }
    }
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 201:
        print(f"[{datetime.now()}] 위치 업데이트 성공: {latitude}, {longitude}")
    else:
        print(f"[{datetime.now()}] 업데이트 실패: {response.text}")

def drone_simulation():
    """드론 이동 시뮬레이션 프로그램."""
    try:
        # 출발지 및 목적지 위치 가져오기
        start_latitude, start_longitude = fetch_location_data(DEPARTURE_URL)
        destination_latitude, destination_longitude = fetch_location_data(ARRIVAL_URL)

        print(f"출발지: {start_latitude}, {start_longitude}")
        print(f"목적지: {destination_latitude}, {destination_longitude}")

        current_latitude = start_latitude
        current_longitude = start_longitude
        steps = 10  # 목적지까지의 이동 단계 수

        for step in range(steps + 1):
            # 이동 비율 계산 (0에서 1까지 증가)
            step_fraction = step / steps
            current_latitude, current_longitude = simulate_movement(
                start_latitude, start_longitude, destination_latitude, destination_longitude, step_fraction
            )

            # 리소스 이름에 현재 시간을 포함
            resource_name = f"location_{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"

            # 위치 정보 전송
            send_data(resource_name, current_latitude, current_longitude)

            # 도착지에 도달하면 종료
            if step == steps:
                print(f"[{datetime.now()}] 드론이 목적지에 도착했습니다!")
                break

            # 다음 업데이트까지 대기
            time.sleep(UPDATE_INTERVAL)

    except ValueError as e:
        print(f"위치 정보 가져오기 실패: {str(e)}")
    except Exception as e:
        print(f"예기치 않은 오류 발생: {str(e)}")

@app.route('/notification', methods=['POST'])
def notification():
    """ACME 서버에서 보낸 알림을 처리하는 엔드포인트."""
    try:
        data = request.json  # 알림 데이터
        print(f"[알림 수신] 데이터: {data}")

        # 'arrived' 상태 확인
        content = json.loads(data["m2m:sgn"]["nev"]["rep"]["m2m:cin"]["con"])
        if content.get("status") == "arrived":
            print("[알림 처리] 상태가 'arrived'입니다. 드론 시뮬레이션을 시작합니다.")
            drone_simulation()
        else:
            print(f"[알림 처리] 상태가 'arrived'가 아닙니다: {content.get('status')}")

        return jsonify({"status": "success"}), 200
    except Exception as e:
        print(f"[알림 처리 오류] {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    # Flask 서버 실행
    app.run(host="127.0.0.1", port=5002)
