# EtherealMind Backend

This is the backend API for the EtherealMind application. It provides endpoints for user authentication, saved posts management, and content delivery.

## Features

- RESTful API built with Express.js
- Firebase integration for authentication and data storage
- In-memory database fallback for development
- API health monitoring
- Environment-specific configuration

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Install dependencies:
```
npm install
```

2. Create a `.env` file based on the environment variables in the FIREBASE_SETUP.md guide.

3. For Firebase integration, set up your service account as described in FIREBASE_SETUP.md.

### Running the Backend

#### Development Mode

```
npm run dev
```

This will start the server with nodemon for automatic reloading on file changes.

#### Production Mode

```
npm start
```

### API Endpoints

- `GET /health` - Check API health and Firebase connection status
- `GET /api/saved-posts/:userId` - Get all saved posts for a user
- `POST /api/saved-posts/:userId` - Save a post for a user
- `DELETE /api/saved-posts/:userId/:postId` - Remove a post from a user's saved posts
- `GET /api/saved-posts/:userId/:postId` - Check if a post is saved by a user

## Storage Modes

The backend can run in two storage modes:

1. **Firebase Firestore** - When properly configured with Firebase credentials
2. **In-Memory Database** - Automatically used as fallback when Firebase is not available

## Development

### Adding New Routes

To add a new endpoint:

1. Create a controller in `src/controllers/`
2. Create a route file in `src/routes/`
3. Import and use the route in `src/server.js`

### Testing

```
npm test
```

## Additional Information

For more details on Firebase setup, see the FIREBASE_SETUP.md file.

## Models

### User
- `uid`: Firebase user ID
- `email`: User email
- `displayName`: User display name
- `createdAt`: Date the user was created

### SavedPost
- `userId`: Reference to a User
- `postId`: ID of the saved post
- `title`: Title of the saved post
- `category`: Category of the saved post
- `savedAt`: Date the post was saved

## Frontend Integration

The frontend application communicates with this API to persist saved posts across sessions and devices. When a user is not authenticated, posts are saved in localStorage as a fallback.

## Error Handling

The API includes comprehensive error handling to provide clear feedback on what went wrong, including:
- Validation errors for missing required fields
- Database errors
- Authentication errors 