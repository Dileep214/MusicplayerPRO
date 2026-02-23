# 🎵 MusicPlayerPRO - Ultimate Music Streaming Platform

Welcome to **MusicPlayerPRO**, a state-of-the-art, high-performance music streaming application built with a modern tech stack. This platform offers a seamless experience for both music lovers and administrators, featuring high-fidelity audio playback, intelligent content management, and a stunning glassmorphic UI.

---

## 🚀 Overview

MusicPlayerPRO is a full-stack web application designed to provide a premium music listening experience. It's built from the ground up prioritizing speed, reliability, and visual excellence. The system is split into a highly responsive **React-based frontend** and a robust **Node.js/Express backend**, with **Cloudinary** handling all media storage requirements.

---

## 🛠️ Technical Stack & Architecture

### 💻 Frontend
The frontend is built for speed and a premium feel, leveraging the latest version of React and Vite.

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Atomic CSS for lightning-fast styling)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API
- **Routing**: React Router DOM 7
- **Authentication**: JWT & @react-oauth/google (Google One Tap & Login)
- **Design Pattern**: Glassmorphism with modern UI micro-interactions.

### ⚙️ Backend
A scalable REST API designed to handle complex media operations and user management.

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **File Uploads**: Multer & Multer-Storage-Cloudinary
- **Security**: bcryptjs for password hashing & JWT for secure sessions
- **Compression**: Gzip/Brotli via `compression` middleware for faster response times.

### ☁️ Storage & Media
- **Provider**: [Cloudinary](https://cloudinary.com/)
- **Storage Strategy**: 
  - **Songs**: High-fidelity audio files stored as 'video' resources for optimized streaming.
  - **Images**: Album covers, playlist thumbnails, and user profile photos.
  - **Auto-Optimization**: Assets are automatically formatted and optimized based on the user's connection.

---

## 📂 Project Structure Analysis

### 📡 Backend (`/backend`)
- `index.js`: The heart of the server, setting up middleware (CORS, JSON, Compression) and connecting to MongoDB.
- `models/`: Mongoose schemas for data integrity.
  - `User.js`: Handles identities, roles (Admin/User), and favorites.
  - `Song.js`: Metadata for tracks including Cloudinary URLs.
  - `Album.js` & `Playlist.js`: Logical groupings for tracks.
- `routes/`: Express routers for different domains (Auth, Admin, Songs, etc.).
- `utils/cloudinary.js`: Custom dynamic storage configuration for handling different file types and naming conventions.
- `scripts/`: Numerous utility scripts for seeding database, syncing covers, and maintenance.

### 🎨 Frontend (`/frontend`)
- `src/main.jsx`: Entry point with theme and global configurations.
- `src/pages/`:
  - `MusicLibraryPage`: The core player interface with song lists and controls.
  - `AdminDashboardPage`: A powerful suite for admins to add, edit, and delete content.
  - `LandingPage`: Beautiful intro for new visitors.
  - `ProfilePage`: User settings and favorite tracks.
- `src/components/`: Modular, reusable UI components like `MusicPlayer`, `NowPlayingView`, and `GlassCard`.
- `src/context/`: Global state for music playback, user authentication, and app settings.

---

## 🌟 Key Features

### 🎧 High-Performance Playback
- Dynamic progress bar with touch-to-seek functionality.
- Real-time volume controls and track switching.
- Persistent state (music keeps playing while you browse the app).

### 🛡️ Secure Admin Panel
- Dedicated dashboard for managing the library.
- Restricted access (Role-based authentication).
- Real-time uploads with progress feedback.

### 🔍 Smart Discovery
- Infinite scrolling/modular loading for large libraries.
- Favorite tracks toggle with optimistic UI updates.
- Playlist organization for personalized listening.

---

## ⚙️ Server & Hosting Details

The application is architected for cloud deployment:
- **Backend**: Hosted on [Render](https://render.com/) (Express service connected to MongoDB Atlas).
- **Frontend**: Hosted on [Vercel](https://vercel.com/) for lightning-fast edge delivery.
- **Environment Variables**: Managed securely through `.env` files for secrets like `MONGO_URI`, `CLOUDINARY_SECRET`, and `JWT_SECRET`.

---

## 🛠️ Getting Started

1. **Clone the repository**
2. **Backend**:
   - `cd backend`
   - `npm install`
   - Fill `.env` with your credentials.
   - `npm start`
3. **Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

---

## 🛡️ Security & Performance Optimization

Recent updates have significantly enhanced the production readiness of MusicPlayerPRO:

### 🔒 Security
- **Helmet**: Secured with [Helmet](https://helmetjs.github.io/) to set various security-focused HTTP headers.
- **Rate Limiting**: Prevent Brute-forcing and DoS attacks using `express-rate-limit` (100 requests per 15 minutes per IP).
- **JWT Refresh Token Rotation**: 
    - Implemented a robust authentication system with Access Tokens (short-lived) and Refresh Tokens (long-lived).
    - **Rotation Mechanism**: Every time a refresh token is used, it is revoked and a new one is issued.
    - **Reuse Detection**: If a revoked token is reused, the system automatically invalidates all tokens for that user to prevent account hijacking.
- **Helmet CSRF/XSS Protections**: Basic protections against common web vulnerabilities.

### ⚡ Performance
- **Caching Layer**: Integrated `node-cache` with a custom middleware to cache frequently accessed data (Albums/Playlists), reducing database load and response times by up to 90%.
- **Response Compression**: Gzip compression implemented for all API responses.
- **Optimized MongoDB Queries**: Use of `.lean()` and targeted field selection for faster data retrieval.

---

## 📊 Database Indexing (MongoDB)

The following indexes have been implemented to ensure high performance even as the database grows:

| Model | Field(s) | Type | Purpose |
| :--- | :--- | :--- | :--- |
| **User** | `email` | Unique | Fast authentication lookups |
| **User** | `googleId` | Sparse Unique | Secure Google OAuth integration |
| **User** | `email, role` | Compound | Optimized authorization for Admin routes |
| **User** | `createdAt` | Single | Fast sorting for recent users |
| **Song** | `title, artist` | Text | Efficient search results |
| **Album** | `createdAt` | Single | Optimized "New Releases" sorting |

---

Created with ❤️ by **Dileep Komarthi**
