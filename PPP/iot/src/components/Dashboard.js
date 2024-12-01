import React, { useEffect, useState } from "react";
import { Map, CustomOverlayMap } from "react-kakao-maps-sdk";
import DataGraph from "./DataGraph";
import { Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useTheme, TextField, Grid2 } from "@mui/material";

function Dashboard() {
  const containerStyle = {
    width: "100%",
    height: "600px",
  };

  const [location, setLocation] = useState(null);
  const [isStolen, setIsStolen] = useState(false);
  const [isArrived, setIsArrived] = useState(false); // 도착 여부
  const [showPopup, setShowPopup] = useState(false); // 팝업 표시 여부
  const [chatMessage, setChatMessage] = useState(""); // 채팅 메시지 상태
  const [chatHistory, setChatHistory] = useState([]); // 채팅 기록
  const [isFetching, setIsFetching] = useState(true);

  const theme = useTheme();


  const userName = "PP-P"; // 사용자 이름 (예시)

  const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // 지구 반지름 (km)
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coords1.lat)) *
        Math.cos(toRad(coords2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 거리 (km)
  };

  useEffect(() => {

    if (!isFetching) return;

    const destination = { lat: 37.55062087654126, lng: 127.07425390537487 }; // destination 정의

    const fetchLocationData = async () => {
      try {
        const response = await fetch("http://localhost:5000/get-location", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const newLocation = {
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude),
          };
          setLocation(newLocation);
          setIsStolen(data.isStolen);

          // 도착 여부 확인
          const distance = haversineDistance(newLocation, destination);
          if (distance < 0.1 && !isArrived) { // 0.1km 이내면 도착
            setIsArrived(true);
            setShowPopup(true);
          }
        } else {
          console.error("Failed to fetch location data");
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    const intervalId = setInterval(fetchLocationData, 5000);

    return () => clearInterval(intervalId);
  }, [isFetching, isArrived]);

  const handlePopupClose = (approved) => {
    setShowPopup(false);
    if (approved) {
      console.log("User approved.");
      setIsFetching(false); // 위치 fetch 중단
      // 추가 로직 (예: API 호출)
    } else {
      console.log("User declined.");
      setIsFetching(true)
    }
  };

  const handleStartFetching = () => {
    setIsFetching(true); // 위치 fetch 다시 시작
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatHistory([...chatHistory, { user: userName, message: chatMessage }]);
      setChatMessage(""); // 메시지 입력창 초기화
    }
  };

  if (!location) {
    return (
      <div className="dashboard-container" style={{ textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontFamily: "'Sour Gummy', cursive" }}>
          Loading location... 😅
        </Typography>
      </div>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 4,
        fontFamily: "'Sour Gummy', cursive",
        padding: 2,
        flexWrap: "wrap",
      }}
    >
      {/* 지도 섹션 */}
      <Box
        sx={{
          flex: 1,
          padding: 2,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h6" align="center" gutterBottom sx={{ fontFamily: "'Sour Gummy', cursive", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>SafetyBox Location</span>
          <Button
            variant="contained"
            size="small"
            onClick={handleStartFetching}
            sx={{ fontFamily: "'Sour Gummy', cursive" }}
          >
            Refresh Location
          </Button>
        </Typography>
        <Map
          center={{ lat: location.lat, lng: location.lng }}
          level={3}
          style={containerStyle}
          appKey="27def025665d22e2a866f398cfb7a3aa"
        >
          {/* Custom Overlay */}
          <CustomOverlayMap position={{ lat: location.lat, lng: location.lng }} zIndex={1}>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img
                src="/marker.png"
                alt="marker"
                style={{ width: "36px", height: "36px" }}
              />
              <div
                className="custom-overlay"
                style={{ fontSize: "14px", fontWeight: "bold", color: "#333", fontFamily: "'Sour Gummy', cursive" }}
              >
                SafetyBox
              </div>
            </div>
          </CustomOverlayMap>
        </Map>
      </Box>

      {/* 도난 여부 및 Sensor Data 섹션 */}
      <Box
        sx={{
          flex: 1,
          padding: 2,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h6" align="center" gutterBottom sx={{ fontFamily: "'Sour Gummy', cursive" }}>
          SafetyBox Status
        </Typography>
        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            padding: 2,
            marginBottom: 2,
            borderRadius: 1,
            backgroundColor: theme.palette.background.paper,
            boxShadow: 1,
          }}
        >
          <Typography variant="subtitle1" color="text.primary" sx={{ fontFamily: "'Sour Gummy', cursive" }}>
            Stolen or not
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: isStolen ? theme.palette.error.main : theme.palette.success.main,
              fontFamily: "'Sour Gummy', cursive",
            }}
          >
            {isStolen ? "Stolen or not" : "Safe"}
          </Typography>
        </Box>
        <DataGraph />
      </Box>

      {/* 팝업 다이얼로그 */}
      <Dialog open={showPopup} onClose={() => handlePopupClose(false)}>
        <DialogTitle sx={{ fontFamily: "'Sour Gummy', cursive", fontSize: '18px' }}>
          Arrival confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: "'Sour Gummy', cursive", fontSize: '18px' }}>
            The drone has arrived at its destination, do you want to proceed with authorisation?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handlePopupClose(true)} 
            color="primary" 
            sx={{ fontFamily: "'Sour Gummy', cursive", fontSize: '18px'}}
          > 
            Yes
          </Button>
          <Button 
            onClick={() => handlePopupClose(false)} 
            color="secondary" 
            sx={{ fontFamily: "'Sour Gummy', cursive", fontSize: '18px' }}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>

      {/* 하단 섹션 추가 */}
      <Box
        sx={{
          width: "100%",
          padding: 3,
          marginTop: 4,
          backgroundColor: "#f5f5f5",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontFamily: "'Sour Gummy', cursive", marginBottom: 2, color: 'blue' }}>
          Contact & Chat with Support
        </Typography>
        
        {/* 채팅 창 */}
        <Box
          sx={{
            padding: 2,
            borderRadius: 2,
            backgroundColor: "#fff",
            marginBottom: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontFamily: "'Sour Gummy', cursive", marginBottom: 2 }}>
            Chat with our team
          </Typography>
          <div style={{ marginBottom: "1rem", maxHeight: "150px", overflowY: "auto" }}>
            {chatHistory.map((chat, index) => (
              <div key={index} style={{ marginBottom: "0.5rem" }}>
                <strong>{chat.user}:</strong> {chat.message}
              </div>
            ))}
          </div>
          <Grid2 container spacing={2}>
            <Grid2 item xs={9}>
              <TextField
                fullWidth
                label="Type your message"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  fontFamily: "'Sour Gummy', cursive",
                  backgroundColor: theme.palette.background.paper,
                }}
              />
            </Grid2>
            <Grid2 item xs={3}>
              <Button
                fullWidth
                onClick={handleSendMessage}
                variant="contained"
                color="primary"
                sx={{
                  fontFamily: "'Sour Gummy', cursive",
                }}
              >
                Send
              </Button>
            </Grid2>
          </Grid2>
        </Box>

        {/* 연락처 및 고객 서비스 정보 */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontFamily: "'Sour Gummy', cursive", marginBottom: 2 }}>
            Contact Info
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: "'Sour Gummy', cursive" }}>
            Email: support@safetybox.com
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: "'Sour Gummy', cursive" }}>
            Phone: +1 800 123 4567
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
