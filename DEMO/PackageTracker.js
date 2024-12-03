import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet"; // For custom icons
import "@fontsource/roboto"; // Use Roboto font

// Custom icons
const droneIcon = L.icon({
  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/3/37/Drone_icon.svg",
  iconSize: [40, 40],
});

const hubIcon = L.icon({
  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/3/30/Red_circle_icon.svg",
  iconSize: [30, 30],
});

const destinationIcon = L.icon({
  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Green_circle_icon.svg",
  iconSize: [30, 30],
});

const PackageTracker = () => {
  const [sensorData, setSensorData] = useState(null); // Set null initially to indicate loading
  const [loading, setLoading] = useState(true); // Manage loading state
  const [dronePosition, setDronePosition] = useState({
    lat: 37.7749,
    lng: -122.4194,
  });

  const hubLocation = { lat: 37.7749, lng: -122.4194 };
  const destinationLocation = { lat: 37.7849, lng: -122.4094 };

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch("http://localhost:5000/sensor-data");
        const data = await response.json();
        setSensorData(data);
        setLoading(false); // Stop loading once data is fetched
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setLoading(false); // Stop loading even if there is an error
      }
    };

    fetchSensorData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <CircularProgress size={50} sx={{ color: "#1976d2" }} />
        <Typography
          variant="h6"
          sx={{
            marginTop: 2,
            fontFamily: "Roboto, sans-serif",
            fontWeight: 400,
            color: "#424242",
          }}
        >
          Loading package tracker...
        </Typography>
      </Box>
    );
  }

  if (!sensorData) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Roboto, sans-serif",
            fontWeight: 400,
            color: "#d32f2f",
            textAlign: "center",
          }}
        >
          Unable to load package tracker data.
          <br />
          Please try refreshing the page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          marginBottom: 4,
          fontWeight: 500,
          fontFamily: "Roboto, sans-serif",
        }}
      >
        Package Tracker
      </Typography>
      <Grid container spacing={3}>
        {/* Left Section: Map */}
        <Grid item xs={12} md={7}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <MapContainer
                center={[hubLocation.lat, hubLocation.lng]}
                zoom={13}
                style={{ height: "400px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                <Marker position={[hubLocation.lat, hubLocation.lng]} icon={hubIcon}>
                  <Popup>Hub</Popup>
                </Marker>

                <Marker position={[destinationLocation.lat, destinationLocation.lng]} icon={destinationIcon}>
                  <Popup>Destination</Popup>
                </Marker>

                <Marker position={[dronePosition.lat, dronePosition.lng]} icon={droneIcon}>
                  <Popup>
                    Drone is here: <br />
                    Latitude: {dronePosition.lat.toFixed(4)} <br />
                    Longitude: {dronePosition.lng.toFixed(4)}
                  </Popup>
                </Marker>

                <Polyline
                  positions={[
                    [hubLocation.lat, hubLocation.lng],
                    [dronePosition.lat, dronePosition.lng],
                    [destinationLocation.lat, destinationLocation.lng],
                  ]}
                  color="blue"
                />
              </MapContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Section: Sensor Data */}
        <Grid item xs={12} md={5}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ marginBottom: 3, fontWeight: 500 }}>
                Sensor Data
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Hub Status:</strong> {sensorData.hub_status}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Drone Status:</strong> {sensorData.drone_status}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Door Status:</strong> {sensorData.door_status}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Temperature:</strong> {sensorData.temperature.toFixed(1)} °C
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Shock Detected:</strong> {sensorData.shock ? "Yes" : "No"}
              </Typography>
              <Typography variant="body1">
                <strong>Door:</strong> {sensorData.open_close}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PackageTracker;
