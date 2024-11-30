import requests
import json
import time
from datetime import datetime, timezone
import random

# ACME 서버 설정
ACME_URL = "http://localhost:8080/cse-in/SafePackage"  # CSEBase와 AE 경로 설정

# 시작 위치와 도착지 설정 (서울 -> 세종대)
start_latitude =  37.557140718019674
start_longitude = 127.07944948917951 
destination_latitude =  37.55062087654126
destination_longitude =  127.07425390537487

# 위치 업데이트 간격 (초)
UPDATE_INTERVAL = 10  # 10분 = 600초

def simulate_movement(lat1, lon1, lat2, lon2, step_fraction):
    """두 좌표 간 선형 보간법으로 위치 이동 시뮬레이션."""
    latitude = lat1 + (lat2 - lat1) * step_fraction
    longitude = lon1 + (lon2 - lon1) * step_fraction
    return latitude, longitude

def send_data(resource_name, latitude, longitude):
    """ACME 서버로 위치 정보 전송."""
    url = f"{ACME_URL}/location"  # 컨테이너 경로
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
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        }
    }
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 201:
        print(f"[{datetime.now()}] 위치 업데이트 성공: {latitude}, {longitude}")
    else:
        print(f"[{datetime.now()}] 업데이트 실패: {response.text}")

def drone_simulation():
    """드론 이동 시뮬레이션 프로그램."""
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

if __name__ == "__main__":
    drone_simulation()
