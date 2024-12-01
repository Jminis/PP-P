from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/notify', methods=['POST'])
def notify():
    # JSON 데이터 수신
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON data'}), 400
   

    # 'con' 값 추출
    con_value = data.get('m2m:sgn', {}).get('nev', {}).get('rep', {}).get('m2m:cin', {}).get('con')
    if not con_value:
        return jsonify({'error': "'con' field is missing in the JSON payload"}), 400
    
    # 'con pi' 값 추출
    pi_data = data.get('m2m:sgn', {}).get('nev', {}).get('rep', {}).get('m2m:cin', {}).get('pi')
    if not pi_data:
        return jsonify({'error': "'pi' field is missing in the JSON payload"}), 400
    
    # WebSocket으로 클라이언트에 전송
    # socketio.emit('notification', {'con': con_value})
    # print(f"Sent notification: {con_value}")
    socketio.emit('notification', {'con': con_value, 'pi': pi_data})
    print(f"Sent notification: cin = {cin_data}, con = {con_value}")
    
    # return jsonify({'status': 'Notification sent', 'con': con_value}), 200
    return jsonify({'status': 'Notification sent', 'cin': cin_data, 'con': con_value}), 200

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)

