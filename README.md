# EtherealMind - Social Platform for Mindfulness

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

## Deployment Instructions

### Prerequisites
- Node.js 16+ installed
- Git installed
- Vercel account
- GitHub account

### Deploying to Vercel

#### Frontend Deployment
1. Push your code to GitHub
   ```
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

2. Import your GitHub repository in Vercel
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Choose the `frontend` directory as the root directory
   - Set the build command to `npm run build`
   - Set the output directory to `dist`
   - Click "Deploy"

3. Environment Variables
   - Add the following environment variables in Vercel's settings:
     - `VITE_API_URL`: Set to your deployed backend URL (e.g., `https://etherealmind-backend.vercel.app/api`)
     - Add all other Firebase variables from `.env`

#### Backend Deployment
1. Import your GitHub repository in Vercel again
   - Create a new project in Vercel
   - Choose the same repository
   - Set the root directory to `backend`
   - The build settings should be automatically detected
   - Click "Deploy"

2. Environment Variables
   - Add all variables from your `backend/.env` file to Vercel's environment variables
   - Ensure `NODE_ENV` is set to `production`

### Testing the Deployment
1. Once deployed, test your frontend:
   - Visit your frontend Vercel URL
   - Check that you can sign up and login
   - Ensure posts are loading correctly

2. Test backend connectivity:
   - Visit your backend Vercel URL + `/health` (e.g., `https://etherealmind-backend.vercel.app/health`)
   - You should see a JSON response with health information

3. Ensure that both frontend and backend can communicate correctly

### Troubleshooting
- Check Vercel logs if you encounter any deployment issues
- Ensure your environment variables are properly set
- CORS issues: Check that your backend is properly configured to accept requests from your frontend domain

## Development

### Running locally
Run the `restart.bat` script to start both the frontend and backend servers locally:
```
.\restart.bat
```

### Structure
- `frontend/`: React application built with Vite
- `backend/`: Express.js API server

## License

This project is licensed under the MIT License - see the LICENSE file for details. 