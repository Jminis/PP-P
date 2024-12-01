import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Box, Typography, useTheme } from "@mui/material";

const data = [
  { time: "10:00", shock: 0.2, temp: 9 },
  { time: "10:05", shock: 0.5, temp: 10 },
  { time: "10:10", shock: 10, temp: 14 },
  { time: "10:15", shock: 8, temp: 13 },
  { time: "10:20", shock: 0.4, temp: 12},
];

function DataGraph() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "95%",
        height: 480,
        padding: 2,
        boxShadow: theme.shadows[3],
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Typography variant="h6" align="center" gutterBottom>
        Sensor Data
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12, fill: theme.palette.text.primary }}
            tickFormatter={(value) => value.slice(0, 5)} // Display time without seconds
            label={{
              value: "Time",
              position: "bottom",
              offset: -1
            }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: theme.palette.text.primary }}
            label={{ value: "value", angle: -90, position: "insideLeft", offset: 10 }}
          />
          <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }} />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontSize: 12, color: theme.palette.text.secondary }}
          />
          <Line
            type="monotone"
            dataKey="shock"
            name="Shock sensor (g)"
            stroke={theme.palette.error.main}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            dot={{ r: 5, fill: theme.palette.error.main }}
          />
          <Line
            type="monotone"
            dataKey="temp"
            name="Temperature sensor (°C)"
            stroke={theme.palette.primary.main}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            dot={{ r: 5, fill: theme.palette.primary.main }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default DataGraph;