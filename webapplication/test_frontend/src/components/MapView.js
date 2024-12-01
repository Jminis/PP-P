import React, { useEffect, useState } from 'react';

const MapView = ({ latitude, longitude }) => {
    const [map, setMap] = useState(null);

    useEffect(() => {
        // 네이버 지도 초기화
        const mapOptions = {
            center: new window.naver.maps.LatLng(latitude || 37.5665, longitude || 126.9780), // 기본값: 서울 시청
            zoom: 15,
        };
        const mapInstance = new window.naver.maps.Map('map', mapOptions);
        setMap(mapInstance);
    }, []);

    useEffect(() => {
        // 지도 중심 업데이트
        if (map && latitude && longitude) {
            const newCenter = new window.naver.maps.LatLng(latitude, longitude);
            map.setCenter(newCenter);
            new window.naver.maps.Marker({
                position: newCenter,
                map: map,
                title: 'SafeBox Location',
            });
        }
    }, [latitude, longitude, map]);

    return <div id="map" style={{ width: '100%', height: '400px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}></div>;
};

export default MapView;
