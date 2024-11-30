import requests
import time

# SafeBox AE 정보
CSE_BASE_URL = "http://127.0.0.1:8080/cse-in"
SAFEBOX_AE = "SafePackage2"
LOCATION_CONTAINER = "location"
HEADERS = {
    "Content-Type": "application/json",
    "X-M2M-Origin": SAFEBOX_AE,
    "X-M2M-RI": "req12345",
    "X-M2M-RVI": "3",
}

def update_location(latitude, longitude):
    # 위치 정보 업데이트 요청
    payload = {
        "m2m:cin": {
            "con": f"{latitude},{longitude}"  # 위치 정보를 쉼표로 구분된 형식으로 저장
        }
    }
    response = requests.post(
        f"{CSE_BASE_URL}/{SAFEBOX_AE}/{LOCATION_CONTAINER}",
        headers=HEADERS,
        json=payload
    )
    if response.status_code in [200, 201]:
        print(f"Location updated: {latitude}, {longitude}")
    else:
        print(f"Failed to update location: {response.status_code}, {response.text}")

def main():
    while True:
        # 예시 위치 데이터를 임의로 생성
        latitude = 37.56 + (0.01 * time.time() % 10)  # 임의의 위도 값
        longitude = 126.97 + (0.01 * time.time() % 10)  # 임의의 경도 값
        update_location(latitude, longitude)
        time.sleep(10)  # 10초 간격으로 위치 업데이트

if __name__ == "__main__":
    main()
