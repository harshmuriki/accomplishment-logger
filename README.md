# Accomplish

A minimalist accomplishment tracker with a warm, journal-style aesthetic. Track your daily achievements with ratings and view your progress over time.

## Features

- ✨ **Simple & Clean UI** - Minimalist design inspired by Pi.website
- 🔐 **Email/Password Authentication** - Secure user accounts with Firebase
- 📝 **Track Accomplishments** - Log achievements with text and rating (1-10)
- 📊 **Journal History** - View all your accomplishments in a beautiful timeline
- 📱 **Apple Shortcuts Integration** - Log accomplishments directly from your iPhone
- 🔄 **Real-time Sync** - Data stored in Firebase Firestore
- 👤 **User Isolation** - Each user has their own private collection

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication + Firestore)
- **Deployment**: Vercel
- **API**: Vercel Serverless Functions

## Prerequisites

- Node.js (v18 or higher)
- Firebase project with:
  - Authentication enabled (Email/Password)
  - Firestore database
  - Environment variables configured

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

Create a `.env` file in the root directory with your Firebase credentials:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

Get these values from:

1. Firebase Console → Project Settings
2. Your apps → Web app configuration

### 3. Enable Firebase Services

In Firebase Console:

- **Authentication**: Enable "Email/Password" sign-in method
- **Firestore**: Create database (start in test mode or production with rules)

### 4. Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
4. Deploy!

The API endpoint will be available at:

```text
https://your-app.vercel.app/api/accomplishments
```

## Apple Shortcuts Integration

Log accomplishments directly from your iPhone using Apple Shortcuts.

### Quick Setup

1. Sign in to the app and click the "ID" button to copy your User ID
2. Create a new shortcut in the Shortcuts app
3. Add actions:

   - Ask for Input (text) - "What did you accomplish?"
   - Ask for Input (number) - "Rating (1-10)?"
   - Get Contents of URL (POST to `/api/accomplishments`)
   - Get Dictionary from Input (parse JSON response)

### API Endpoint

**POST** `/api/accomplishments`

**Request Body:**

```json
{
  "text": "Your accomplishment",
  "rating": 7,
  "userId": "your-firebase-user-id",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response:**

```json
{
  "id": "document-id",
  "text": "Your accomplishment",
  "rating": 7,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Project Structure

```text
├── api/
│   └── accomplishments.ts    # Vercel serverless function
├── components/
│   ├── AccomplishmentList.tsx # Journal history display
│   ├── AuthButton.tsx         # Sign in/out component
│   └── InputForm.tsx          # Accomplishment input form
├── services/
│   └── firebase.ts            # Firebase configuration & functions
├── App.tsx                    # Main app component
├── types.ts                   # TypeScript type definitions
└── vercel.json                # Vercel configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

Private project
