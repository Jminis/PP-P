import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const Notify = () => {
    const [notifications, setNotifications] = useState([]);
    const socketRef = useRef(null); // 소켓 객체를 useRef로 관리

    // 임계값 정의 (pi를 기준으로 설정)
    const thresholds = {
        "cnt7222237939347252231": 300, // Shock 임계값
        "cnt8599142350661952296": 40,  // Temperature 임계값
        "cnt4490345565476932953": "on" // Open 상태값
    };

    useEffect(() => {
        // 소켓 연결
        socketRef.current = io('http://127.0.0.1:5000', {
            transports: ['websocket'], // WebSocket 사용 강제
            reconnectionAttempts: 5, // 재연결 시도 횟수
        });

        // 소켓 연결 성공 시
        socketRef.current.on('connect', () => {
            console.log('Connected to server');
        });
	
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
            //} else if (pi == 
	    //	(con > threshold) {
            //    alert(`ALERT! Value(${con}) > Threshold(${threshold})`); // 알림창
            //}

            // 모든 알림을 상태에 저장
           setNotifications((prev) => [...prev, { con, cin }]);
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
    }, []); // 빈 배열로 두어 컴포넌트 마운트 시 한 번만 실행

    return (
        <div>
            <h1>Notifications</h1>
            <ul>
                {notifications.map((notif, index) => (
                    <li key={index}>{notif}</li>
                ))}
            </ul>
        </div>
    );
};

export default Notify;

