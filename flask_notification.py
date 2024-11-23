from flask import Flask, request, jsonify

# Flask 애플리케이션 생성
app = Flask(__name__)

# Notification 엔드포인트 정의
@app.route('/notification', methods=['POST'])
def handle_notification():
    # 수신한 JSON 데이터
    data = request.json
    print("Notification received:", data)  # 콘솔에 출력
    # 응답 전송
    return jsonify({"status": "success"}), 200

if __name__ == "__main__":
    # 서버 실행
    app.run(host="0.0.0.0", port=8083)

