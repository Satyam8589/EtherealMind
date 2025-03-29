# Firebase Setup Guide

This guide will help you set up Firebase for your EtherealMind backend.

## Creating a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** and follow the prompts to create a new project
3. Once your project is created, click on the gear icon (⚙️) next to "Project Overview" and select "Project settings"

## Setting up Firestore Database

1. In your Firebase project, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode" (for development)
4. Select a location for your database that's closest to your users
5. Click "Enable"

## Getting Service Account Credentials

1. In your Firebase project settings, go to the "Service accounts" tab
2. Click "Generate new private key" button
3. This will download a JSON file containing your service account credentials
4. Rename this file to `service-account.json` and place it in the backend directory (do not commit this to git)

## Configuring Environment Variables

1. In the backend directory, you'll find a `.env` file (create one if it doesn't exist)
2. Update the following variables:

```
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# Service Account Credentials
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

Alternatively, you can set the `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable with the entire JSON content of your service account file.

## Firestore Rules

For security, update your Firestore rules in the Firebase console:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write only their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write only their own saved posts
    match /savedPosts/{postId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Common resources available to all authenticated users
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.authorId;
    }
  }
}
```

## Using Firebase Emulator (Optional - for development)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase: `firebase init`
   - Select Firestore and Emulators
   - Choose your project
   - For emulators, select at least Firestore
4. Start emulators: `firebase emulators:start`
5. Update your `.env` file:

```
USE_FIREBASE_EMULATOR=true
FIRESTORE_EMULATOR_HOST=localhost:8080
```

## Testing the Connection

Start your backend server:

```
npm run dev
```

Check the health endpoint:

```
curl http://localhost:5000/health
```

You should see `"firebaseConnected": true` in the response if everything is set up correctly. 