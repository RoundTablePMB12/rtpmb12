# Volunteer Roster Application

A web application for managing volunteer rosters for various projects. Built with Next.js, React, TypeScript, and Firebase.

## Features

- Create and manage projects with specific time ranges
- Add and remove roles for each project
- Create a roster grid showing time slots and roles
- Sign up volunteers for specific time slots and roles
- Store all data in Firebase for persistence

## Getting Started

### Prerequisites

- Node.js 18.x or later
- pnpm (recommended) or npm
- Firebase account

### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Set up Firestore Database
   - Go to Firestore Database in the left sidebar
   - Click "Create database"
   - Start in production mode or test mode (you can change this later)
   - Choose a location close to your users
4. Set up Authentication (if you want to use it)
   - Go to Authentication in the left sidebar
   - Click "Get started"
   - Enable the authentication methods you want to use (Email/Password is a good start)
5. Get your Firebase configuration
   - Go to Project Settings (gear icon in the left sidebar)
   - Scroll down to "Your apps" section
   - Click the web app icon (</>) to create a web app
   - Register your app with a nickname
   - Copy the Firebase configuration object

### Application Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env.local` file in the root directory with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Firestore Data Structure

The application uses the following Firestore data structure:

- **Collection**: `projects`
  - **Document**: `{projectId}`
    - `name`: string
    - `startTime`: number
    - `endTime`: number
    - `roles`: string[]
    - `volunteerData`: object
      - `{timeSlot}`: object
        - `{role}`: string | false
    - `createdAt`: timestamp
    - `updatedAt`: timestamp

## Deployment

This application can be deployed to Vercel, Netlify, or any other platform that supports Next.js applications.

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Add your environment variables
5. Deploy

## License

This project is licensed under the MIT License. 