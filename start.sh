#!/bin/bash

# Navigate to IN-CSE folder and run the Python module in the background, suppressing output
cd IN-CSE
python -m acmecse > /dev/null 2>&1 &

# Navigate to MN-CSE1 folder and run the Python module in the background, suppressing output
cd ../MN-CSE1
python -m acmecse > /dev/null 2>&1 &

# Navigate to MN-CSE2 folder and run the Python module in the background, suppressing output
cd ../MN-CSE2
python -m acmecse > /dev/null 2>&1 &

# Navigate to DEMO folder and run the demo script in the background, suppressing output
cd ../DEMO
python3 demo_with_drone.py > /dev/null 2>&1 &

# Navigate to webapplication/frontend and start npm in the background, suppressing output
cd ../webapplication/frontend
npm start > /dev/null 2>&1 &

# Navigate to webapplication/backend and run the app in the background, suppressing output
cd ../backend
python3 app.py > /dev/null 2>&1 &

# Wait for a Ctrl+C interrupt and terminate all background processes
trap "kill 0" SIGINT
wait

