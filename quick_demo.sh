#!/bin/bash

# Run IN-CSE
cd IN-CSE
python -m acmecse > /dev/null 2>&1 &

# Run MN-CSE1(homegateway)
cd ../MN-CSE1
python -m acmecse > /dev/null 2>&1 &

# Run MN-CSE2(hubgateway)
cd ../MN-CSE2
python -m acmecse > /dev/null 2>&1 &

# Run Virtual Drone AE
cd ../DEMO
python3 demo_with_drone.py > /dev/null 2>&1 &

# Run webapplication-frontend
cd ../webapplication/frontend
npm start > /dev/null 2>&1 &

# Run webapplication-backend
cd ../backend
python3 app.py > /dev/null 2>&1 &

# Wait for a Ctrl+C interrupt and terminate all background processes
trap "kill 0" SIGINT
wait

