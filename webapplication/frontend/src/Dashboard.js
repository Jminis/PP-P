import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const Dashboard = () => {
    const [sensorData, setSensorData] = useState({ shock: '', temperature: '', opend: '' });
    const [deliveryInfo, setDeliveryInfo] = useState({ destination: '', receiver: '', sender: '' });
    const [timeline, setTimeline] = useState([]);
    const socketRef = useRef(null);
     
    // 임계값 정의 (pi를 기준으로 설정)
    const thresholds = {
        "cnt882515336279436808": 300, // Shock 임계값
        "cnt8599142350661952296": 40,  // Temperature 임계값
        "cnt4490345565476932953": "on" // Open 상태값
    };

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
        // socketRef.current.on('notification', (data) => {
        //    console.log('Received notification:', data);
        //    alert(`New Notification!: ${data.con}`); // 알림창에 'con' 값 표시
        //});
	
	// 알림 이벤트 수신
        socketRef.current.on('notification', (data) => {
            console.log('Received notification:', data); // 수신 확인 로그

            const { con, pi } = data; // `data` 객체에서 `con`과 `pi` 추출

            // 해당 con 값에 대한 임계값 가져오기
            const threshold = thresholds[pi];

            // console.log('Extracted con:', con);
            // console.log('Extracted pi:', pi);

            if (pi === "cnt4490345565476932953") {   // Open
                if (con === threshold) {
                    alert(`ALERT! Safe Package is open`); // 알림창
               }
            } else {   // Shock or Temperature
                if (Number(con) > threshold) {
                    alert(`ALERT! Value(${con}) > Threshold(${threshold})`); // 알림창
               }
            }
            // if (threshold === undefined) {
            //     console.warn(`Unknown con type: ${con}`); // 알 수 없는 con 값 처리
            //} else if (pi ==                                                                     //  (con > threshold) {
            //    alert(`ALERT! Value(${con}) > Threshold(${threshold})`); // 알림창
            //}

            // 모든 알림을 상태에 저장
            // setNotifications((prev) => [...prev, { con, cin }]);
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
        console.log('Fetching all data...');
        try {
            // Fetch Delivery Info
/*
            const deliveryResponse = await fetch('http://127.0.0.1:8000/bbbb', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const deliveryJson = await deliveryResponse.json();
            setDeliveryInfo(deliveryJson);
*/
            // Fetch Shock Data
            const shockResponse = await fetch('http://127.0.0.1:8080/cse-in/SafePackage2/shock/la', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-M2M-Origin': 'SafePackage2',
                    'X-M2M-RI': 'req12345',
                    'X-M2M-RVI': '3',
                },
            });

            if (shockResponse.ok) {
                const shockJson = await shockResponse.json();
                console.log('Shock data JSON:', shockJson);
                const shockValue = shockJson?.['m2m:cin']?.['con'] || 'No data';
                setSensorData((prevData) => ({ ...prevData, shock: shockValue }));
            } else {
                console.error('Error fetching shock data:', shockResponse.status);
                setSensorData((prevData) => ({ ...prevData, shock: 'Error' }));
            }

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

