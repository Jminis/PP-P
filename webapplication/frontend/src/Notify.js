import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const Notify = () => {
    const [notifications, setNotifications] = useState([]);
    const socketRef = useRef(null); // 소켓 객체를 useRef로 관리

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
            setNotifications((prev) => [...prev, data.message]);
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

