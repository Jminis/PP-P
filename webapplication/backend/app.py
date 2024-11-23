from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/notify', methods=['POST'])
def notify():
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Message field is required'}), 400

    socketio.emit('notification', {'message': data['message']})
    return jsonify({'status': 'Notification sent'}), 200

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)

