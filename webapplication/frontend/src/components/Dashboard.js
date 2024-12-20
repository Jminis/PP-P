import React, { useEffect, useState, useRef } from "react";
import { Map, CustomOverlayMap } from "react-kakao-maps-sdk";
import DataGraph from "./DataGraph";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  TextField,
  Grid,
} from "@mui/material";

function Dashboard() {
  const containerStyle = {
    width: "100%",
    height: "600px",
  };

  const [location, setLocation] = useState(null);
  const [sensorData, setSensorData] = useState({ Shock: "", Temperature: "", Open: "" });
  const [timelineData, setTimelineData] = useState([]);
  const [isArrived, setIsArrived] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [shockPopup, setShockPopup] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const theme = useTheme();

  const destination = { lat: 37.55062087654126, lng: 127.07425390537487 };
  const userName = "PP-P";

  const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coords1.lat)) *
        Math.cos(toRad(coords2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  let lastUpdateTime = 0;

  const updateTimelineData = (newSensorData) => {
    const currentTime = Date.now();
    if (currentTime - lastUpdateTime < 1000) {
      return;
    }
    lastUpdateTime = currentTime;

    const timestamp = new Date().toLocaleTimeString();
    setTimelineData((prevData) => [
      ...prevData,
      {
        time: timestamp,
        Shock: parseFloat(newSensorData.Shock) || 0,
        Temperature: parseFloat(newSensorData.Temperature) || 0,
      },
    ]);

    if (parseFloat(newSensorData.Shock) >= 40.0) {
      setShockPopup(true);
    }
  };

  const fetchSensorData = async (type) => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/cse-in/SafePackage/${type}/la`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-M2M-Origin": "SafePackage",
          "X-M2M-RI": "req-fetch-instance-webapplication",
          "X-M2M-RVI": "3",
        },
      });

      if (response.ok) {
        const json = await response.json();
        const value = json?.["m2m:cin"]?.["con"] || "No data";
        setSensorData((prevData) => {
          const newData = { ...prevData, [type]: value };
          if (type === "Temperature" || type === "Shock") {
            updateTimelineData(newData);
          }
          return newData;
        });
      } else {
        console.error(`Error fetching ${type} data:`, response.status);
        setSensorData((prevData) => ({ ...prevData, [type]: "Error" }));
      }
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
      setSensorData((prevData) => ({ ...prevData, [type]: "Error" }));
    }
  };

  const fetchAllSensorData = () => {
    fetchSensorData("Shock");
    fetchSensorData("Temperature");
    fetchSensorData("Open");
  };

  useEffect(() => {
    if (!isFetching) return;

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

          const distance = haversineDistance(newLocation, destination);
          if (distance < 0.01 && !isArrived) {
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

    fetchLocationData();
    fetchAllSensorData();

    const intervalId = setInterval(() => {
      fetchLocationData();
      fetchAllSensorData();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [isFetching]);

  const handlePopupClose = (approved) => {
    setShowPopup(false);
    if (approved) {
      console.log("User approved.");
      setIsFetching(false);
    } else {
      console.log("User declined.");
    }
  };

  const handleShockPopupClose = () => {
    setShockPopup(false);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatHistory([...chatHistory, { user: userName, message: chatMessage }]);
      setChatMessage("");
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
      {/* Map Section */}
      <Box sx={{ flex: 1, padding: 2, borderRadius: 2, boxShadow: 3, backgroundColor: "#fff" }}>
        <Typography variant="h6" align="center" gutterBottom>
          SafetyBox Location
        </Typography>
        <Map
          center={{ lat: location?.lat || 0, lng: location?.lng || 0 }}
          level={3}
          style={containerStyle}
          appKey="27def025665d22e2a866f398cfb7a3aa"
        >
          <CustomOverlayMap position={location} zIndex={1}>
            <div style={{ textAlign: "center" }}>
              <img src="/marker.png" alt="marker" style={{ width: "36px", height: "36px" }} />
              <div>SafetyBox</div>
            </div>
          </CustomOverlayMap>
        </Map>
      </Box>

      {/* Status Section */}
      <Box sx={{ flex: 1, padding: 2, borderRadius: 2, boxShadow: 3, backgroundColor: "#fff" }}>
        <Typography variant="h6" align="center" gutterBottom>
          SafetyBox Status
        </Typography>
        <DataGraph timelineData={timelineData} />
      </Box>

      {/* Chat Section */}
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
        <Typography variant="h6" sx={{ fontFamily: "'Sour Gummy', cursive", marginBottom: 2, color: "blue" }}>
          Contact & Chat with Support
        </Typography>
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
          <Grid container spacing={2}>
            <Grid item xs={9}>
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
            </Grid>
            <Grid item xs={3}>
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
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Arrival Popup */}
      <Dialog open={showPopup} onClose={() => handlePopupClose(false)}>
        <DialogTitle>Arrival Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>The drone has arrived. Authorize?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handlePopupClose(true)}>Yes</Button>
          <Button onClick={() => handlePopupClose(false)}>No</Button>
        </DialogActions>
      </Dialog>

      {/* Shock Alert Popup */}
      <Dialog open={shockPopup} onClose={handleShockPopupClose}>
        <DialogTitle>Alert</DialogTitle>
        <DialogContent>
          <DialogContentText>Shock detected! Please check the package.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShockPopupClose}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard;
