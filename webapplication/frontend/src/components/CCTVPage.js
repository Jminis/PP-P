import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

const CCTVPage = () => {
  const [lockTimeout, setLockTimeout] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);

  const virtualRecordings = Array.from({ length: 9 }, (_, index) => ({
    id: index + 1,
    fileName: `recording_${1}.mp4`,
    date: new Date(),
    imageUrl: `/recording_${1}.png`,
  }));

  const handleRecordingSelect = (recording) => {
    setSelectedRecording(recording);
  };


  const sendCommand = async (command) => {
    try {
      setLoading(true);
      const timestamp = new Date().toISOString();

      const commandData = {
        "m2m:cin": {
          "rn": `command_${timestamp.replace(/[:.]/g, '_')}`,
          "con": {
            "command": command,
            "timestamp": timestamp,
          },
        },
      };

      const response = await fetch('http://localhost:5000/send-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commandData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      setResponseMessage(data.message || "Command executed successfully");
      alert(`${command} command sent successfully: ${data.message}`);
    } catch (error) {
      console.error('Error sending command:', error);
      setResponseMessage(`Error: ${error.message}`);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDoorLock = () => {
    sendCommand('unlocked');

    if (lockTimeout) {
      clearTimeout(lockTimeout);
    }

    const newTimeout = setTimeout(() => {
      sendCommand('locked');
      setLockTimeout(null);
    }, 3000);

    setLockTimeout(newTimeout);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* CCTV Live Stream section */}
      <Box sx={{ flex: 2, padding: 3, backgroundColor: '#f5f5f5', borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontFamily: "'Sour Gummy', cursive", marginTop: '20px' }}>
          CCTV Live Stream
        </Typography>
        <div className="video-placeholder" style={{ height: 'calc(100% - 50px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {selectedRecording ? (
            <video width="80%" height="100%" controls autoPlay loop>
              <source src={`/videos/${selectedRecording.fileName}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <Typography variant="body1" color="textSecondary">
              No recording selected
            </Typography>
          )}
        </div>
      </Box>

      {/* 녹화본 선택 섹션 */}
      <Box sx={{ flex: 1, padding: 3, backgroundColor: "#f5f5f5", borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
        <Typography variant="h6" align="center" sx={{ fontFamily: "'Sour Gummy', cursive", marginBottom: 2 }}>
          Select a Recording
        </Typography>
        <div className="recordings-list" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {virtualRecordings.length > 0 ? (
            virtualRecordings.map((recording) => (
              <div
                key={recording.id}
                onClick={() => handleRecordingSelect(recording)}
                style={{
                  width: '30%',
                  marginBottom: '20px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <img
                  src={recording.imageUrl}
                  alt={`Recording ${recording.id}`}
                  style={{
                    width: '10%',
                    height: '50px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
                <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1, fontFamily: "'Sour Gummy', cursive" }}>
                  {`Recording ${recording.id}`}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(recording.date).toLocaleDateString()}
                </Typography>
              </div>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary">
              No recordings available
            </Typography>
          )}
        </div>
      </Box>

      {/* Door Control section */}
      <Box sx={{ padding: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDoorLock}
          size="large"
          fullWidth
          sx={{
            backgroundColor: '#d32f2f',
            '&:hover': {
              backgroundColor: '#c62828',
            },
            padding: '12px',
            fontSize: '18px',
            fontWeight: '600',
            fontFamily: "'Sour Gummy', cursive",
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Unlock Door'}
        </Button>
        {responseMessage && (
          <Typography variant="body1" color="textSecondary" sx={{ marginTop: '20px' }}>
            {responseMessage}
          </Typography>
        )}
      </Box>
    </div>
  );
};

export default CCTVPage;
