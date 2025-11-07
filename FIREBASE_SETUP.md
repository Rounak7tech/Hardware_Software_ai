# Firebase Setup Guide

This guide will help you set up Firebase for your Hardware/Software AI project.

## Prerequisites

- A Firebase account (create one at [firebase.google.com](https://firebase.google.com))
- Node.js and npm installed
- This project with Firebase dependencies already installed

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "hardware-software-ai")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Optionally enable other sign-in methods like Google, GitHub, etc.

## Step 3: Create a Firestore Database

1. In your Firebase project console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database (choose the closest to your users)
5. Click "Done"

## Step 4: Get Your Firebase Configuration

1. In your Firebase project console, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Enter an app nickname (e.g., "Hardware AI Web App")
5. Optionally check "Also set up Firebase Hosting"
6. Click "Register app"
7. Copy the Firebase configuration object

## Step 5: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Replace the values with the ones from your Firebase configuration.

## Step 6: Set Up Firestore Security Rules

In the Firestore Database section, go to "Rules" tab and update the rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own projects and libraries
    match /projects/{projectId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /userLibraries/{libraryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Step 7: Test Your Setup

1. Start your development server: `npm run dev`
2. Navigate to your app and try creating an account
3. Check the Firebase console to see if users are being created
4. Try creating a project and check if it appears in Firestore

## Features Included

### Authentication
- User registration and login
- Password-based authentication
- User session management
- Protected routes (can be implemented)

### Firestore Integration
- Project storage and retrieval
- User library management
- Real-time updates
- Data persistence

### PDF Export
- Export project documentation to PDF
- Include code, wiring instructions, and component lists
- Multiple export formats (full documentation, element capture, etc.)

## Usage Examples

### Authentication
```typescript
import { useAuth } from './contexts/AuthContext';

const { user, signIn, signUp, signOut } = useAuth();

// Sign up
await signUp('user@example.com', 'password123');

// Sign in
await signIn('user@example.com', 'password123');

// Sign out
await signOut();
```

### PDF Export
```typescript
import { exportProjectDocumentation } from './utils/pdfExport';

const projectData = {
  name: 'My Project',
  description: 'A cool hardware project',
  components: ['ESP32', 'Sensor'],
  difficulty: 'Medium',
  code: '// Your code here',
  wiring: [/* wiring steps */]
};

await exportProjectDocumentation(projectData);
```

## Troubleshooting

### Common Issues

1. **Firebase config errors**: Make sure all environment variables are set correctly
2. **Authentication not working**: Check if Email/Password is enabled in Firebase console
3. **Firestore permission denied**: Update your security rules
4. **PDF export fails**: Ensure the target element exists and has content

### Getting Help

- Check the [Firebase Documentation](https://firebase.google.com/docs)
- Review the console for error messages
- Ensure your Firebase project is properly configured

## Security Notes

- Never commit your `.env` file to version control
- Use Firebase security rules to protect user data
- Consider implementing additional validation on the client side
- For production, review and tighten your security rules

