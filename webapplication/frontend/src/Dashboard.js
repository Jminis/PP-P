import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const Dashboard = () => {
    const [sensorData, setSensorData] = useState({ shock: '', temperature: '', opend: '' });
    const [deliveryInfo, setDeliveryInfo] = useState({ destination: '', receiver: '', sender: '' });
    const [timeline, setTimeline] = useState([]);
    const socketRef = useRef(null);

    // 소켓 연결 및 알림 처리
    useEffect(() => {
        socketRef.current = io('http://127.0.0.1:5000', {
            transports: ['websocket'], // WebSocket 사용 강제
            reconnectionAttempts: 5, // 재연결 시도 횟수
        });

        // 소켓 연결 성공
        socketRef.current.on('connect', () => {
            console.log('Connected to server');
        });

        // 알림 이벤트 수신
        socketRef.current.on('notification', (data) => {
            console.log('Received notification:', data);
            alert(`New Notification: ${data.message}`); // 알림창
        });

        // 연결 오류 처리
        socketRef.current.on('connect_error', (err) => {
            console.error('Connection error:', err);
        });

        // 컴포넌트 언마운트 시 소켓 정리
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                console.log('Disconnected from server');
            }
        };
    }, []);

    // Fetch All Data
    const fetchAllData = async () => {
        try {
            // Fetch Delivery Info
            const deliveryResponse = await fetch('http://127.0.0.1:8000/bbbb', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const deliveryJson = await deliveryResponse.json();
            setDeliveryInfo(deliveryJson);

            // Fetch Sensor Data
            const sensorResponse = await fetch('http://127.0.0.1:8000/aaaa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const sensorJson = await sensorResponse.json();
            setSensorData(sensorJson);

            // Fetch Timeline Data
            const timelineResponse = await fetch('http://127.0.0.1:8000/cccc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const timelineJson = await timelineResponse.json();
            setTimeline(timelineJson);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div className="dashboard">
            {/* 왼쪽 패널: 실시간 위치 정보 */}
            <div className="left-panel">
                <h2>Real-Time Location</h2>
                <div className="location-box">
                    <p>Latitude: --</p>
                    <p>Longitude: --</p>
                    <p>Status: Updating...</p>
                </div>
            </div>

            {/* 오른쪽 패널: 배송 정보, 센서 데이터, 타임라인 */}
            <div className="right-panel">
                <h2>Delivery Information</h2>
                <div className="delivery-box">
                    <p><strong>Destination:</strong> {deliveryInfo.destination || 'Loading...'}</p>
                    <p><strong>Receiver:</strong> {deliveryInfo.receiver || 'Loading...'}</p>
                    <p><strong>Sender:</strong> {deliveryInfo.sender || 'Loading...'}</p>
                </div>

                <h2>Sensor Data</h2>
                <div className="sensor-box">
                    <p><strong>Shock:</strong> {sensorData.shock || 'Loading...'}</p>
                    <p><strong>Temperature:</strong> {sensorData.temperature || 'Loading...'}</p>
                    <p><strong>Opend:</strong> {sensorData.opend || 'Loading...'}</p>
                </div>

                <h2>Timeline</h2>
                <div className="timeline-box">
                    {timeline.length > 0 ? (
                        <ul>
                            {timeline.map((event, index) => (
                                <li key={index}>
                                    <p><strong>Time:</strong> {event.time}</p>
                                    <p><strong>Description:</strong> {event.description}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Loading timeline...</p>
                    )}
                </div>

                <button onClick={fetchAllData}>Fetch All Data</button>
            </div>
        </div>
    );
};

export default Dashboard;
