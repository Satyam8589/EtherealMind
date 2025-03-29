# EtherealMind

EtherealMind is a learning platform where users can explore, save, and interact with educational content across various fields.

![EtherealMind](frontend/public/images/ethemind_logo.png)

## Features

- User authentication with Firebase
- Browse educational content on the Explore page
- Save and manage favorite content on the Profile page
- Create new posts with a rich editor
- Responsive design for mobile and desktop

## Tech Stack

### Frontend
- React.js
- CSS Modules
- React Router
- Firebase Authentication
- React Toastify

### Backend
- Node.js
- Express
- Firebase/Firestore (with in-memory fallback for development)

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/etherealmind.git
cd etherealmind
```

2. Install dependencies for both frontend and backend
```
cd frontend && npm install
cd ../backend && npm install
cd ..
```

3. Set up Firebase (optional - the app can run with in-memory storage)
   - Follow the instructions in [backend/FIREBASE_SETUP.md](backend/FIREBASE_SETUP.md)

### Running the Application

You can start both the frontend and backend with the provided start script:

```
chmod +x start.sh
./start.sh
```

Or run them individually:

**Backend**
```
cd backend
npm run dev
```

**Frontend**
```
cd frontend
npm run dev
```

## Development

### Frontend
The frontend server runs at http://localhost:3000 by default.

### Backend
The backend API server runs at http://localhost:5000 by default.

- Health check: http://localhost:5000/health
- API endpoint: http://localhost:5000/api

## Directory Structure

```
etherealmind/
├── frontend/             # React frontend code
│   ├── public/           # Static assets
│   └── src/              # Source files
│       ├── components/   # React components
│       ├── contexts/     # React contexts
│       ├── styles/       # CSS styles
│       └── App.jsx       # Main App component
├── backend/              # Node.js backend code
│   ├── src/              # Source files
│   │   ├── controllers/  # API controllers
│   │   ├── routes/       # API routes
│   │   └── server.js     # Express server
│   └── FIREBASE_SETUP.md # Firebase setup guide
└── start.sh              # Startup script
```

## Development Mode

By default, the application runs with an in-memory database if Firebase is not configured. This makes it easy to test and develop without setting up Firebase.

To use Firebase:
1. Follow the setup guide in [backend/FIREBASE_SETUP.md](backend/FIREBASE_SETUP.md)
2. Create a `service-account.json` file in the backend directory or set the appropriate environment variables

## License

This project is licensed under the MIT License - see the LICENSE file for details. 