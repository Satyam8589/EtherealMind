#!/bin/bash
# EtherealMind Starter Script

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
  echo -e "\n${CYAN}==== $1 ====${NC}\n"
}

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check requirements
print_header "Checking requirements"

# Check for Node.js
if ! command_exists node; then
  echo -e "${RED}Error: Node.js is not installed${NC}"
  echo -e "Please install Node.js from: https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d "v" -f 2)
echo -e "${GREEN}✓ Node.js${NC} (v$NODE_VERSION)"

# Check for NPM
if ! command_exists npm; then
  echo -e "${RED}Error: npm is not installed${NC}"
  echo -e "Please install npm"
  exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm${NC} (v$NPM_VERSION)"

# Function to start the backend server
start_backend() {
  print_header "Starting Backend Server"
  
  cd backend
  
  # Check if node_modules exists, if not, install dependencies
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
  fi
  
  # Start the server
  echo -e "${GREEN}Starting backend server...${NC}"
  npm run dev &
  BACKEND_PID=$!
  
  echo -e "Backend server running with PID: $BACKEND_PID"
  
  # Return to the parent directory
  cd ..
  
  # Wait a moment for the server to start
  sleep 2
}

# Function to start the frontend server
start_frontend() {
  print_header "Starting Frontend Server"
  
  cd frontend
  
  # Check if node_modules exists, if not, install dependencies
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
  fi
  
  # Start the development server
  echo -e "${GREEN}Starting frontend development server...${NC}"
  npm run dev &
  FRONTEND_PID=$!
  
  echo -e "Frontend server running with PID: $FRONTEND_PID"
  
  # Return to the parent directory
  cd ..
}

# Function to display health check information
check_health() {
  print_header "Checking Service Health"
  
  # Wait a moment for servers to be fully ready
  sleep 3
  
  # Check backend health
  echo -e "${YELLOW}Checking backend health...${NC}"
  if command_exists curl; then
    HEALTH_CHECK=$(curl -s http://localhost:5000/health)
    echo -e "${GREEN}Backend Health:${NC} $HEALTH_CHECK"
  else
    echo -e "${YELLOW}Curl not installed. Cannot verify backend health automatically.${NC}"
    echo -e "Visit http://localhost:5000/health in your browser to check health."
  fi
  
  echo -e "\n${GREEN}✓ Frontend${NC} should be available at: http://localhost:3000"
  echo -e "${GREEN}✓ Backend API${NC} should be available at: http://localhost:5000"
}

# Start services
start_backend
start_frontend
check_health

# Instructions for the user
print_header "EtherealMind is Running"
echo -e "Open ${CYAN}http://localhost:3000${NC} in your browser to use the application"
echo -e "\nPress Ctrl+C to stop all services\n"

# Keep the script running and handle termination
trap "echo -e '\n${YELLOW}Stopping servers...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait 