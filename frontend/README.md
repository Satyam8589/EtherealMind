# EtherealMind Frontend

This is the frontend application for EtherealMind, a learning platform where users can explore, save, and interact with educational content.

## Features

- User authentication with Firebase
- Interactive Explore page for discovering content
- Profile page for managing saved content
- Create and edit posts
- Responsive design for all devices

## Tech Stack

- React.js
- React Router for navigation
- CSS Modules for styling
- Firebase Authentication
- React Toastify for notifications
- Context API for state management

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Install dependencies:
```
npm install
```

2. Create a `.env` file based on the `.env.example` template.

### Running the Application

#### Development Mode

```
npm run dev
```

This will start the Vite development server, typically at http://localhost:3000.

#### Building for Production

```
npm run build
```

This will create an optimized build in the `dist` directory.

### Preview Production Build

```
npm run preview
```

## Project Structure

```
frontend/
├── public/           # Static assets
│   ├── images/       # Image files
│   └── fonts/        # Font files
├── src/              # Source code
│   ├── components/   # React components
│   │   ├── auth/     # Authentication components
│   │   ├── common/   # Shared components
│   │   └── ...       # Feature-specific components
│   ├── contexts/     # React contexts
│   ├── styles/       # CSS styles
│   ├── firebase.js   # Firebase configuration
│   └── App.jsx       # Main App component
└── index.html        # HTML entry point
```

## Key Components

- **App.jsx**: Main application component with routing
- **ExplorePage.jsx**: Browse and discover educational content
- **ProfilePage.jsx**: User profile and saved content management
- **PostCreationPage.jsx**: Create and edit posts
- **SavedPostsContext.jsx**: Context for managing saved posts state
- **AuthContext.jsx**: Context for managing authentication state

## Environment Variables

The frontend uses environment variables for configuration. Create a `.env` file with the following variables:

```
# See .env.example for all required variables
```

## Development

### Adding New Features

1. Create components in the appropriate directory
2. Update the router in App.jsx if needed
3. Ensure CSS styles follow the existing patterns
4. Add any new contexts as needed for state management

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use descriptive variable and function names
- Add comments for complex logic

## License

This project is licensed under the MIT License - see the LICENSE file for details.
