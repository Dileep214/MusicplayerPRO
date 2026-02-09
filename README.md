# 🎵 MusicPlayerPRO

A modern, full-stack music streaming application built with React, Node.js, Express, and MongoDB. Features a premium UI with wave-styled progress bars, playlist management, favorites system, and admin panel for content management.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.2.0-61dafb.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [How It Works](#-how-it-works)
- [Development](#-development)
- [Scripts](#-scripts)
- [Contributing](#-contributing)

---

## ✨ Features

### User Features
- 🎧 **Music Streaming** - Stream songs with a beautiful, responsive audio player
- 🌊 **Wave-Styled UI** - Premium design with wavy progress bars and smooth animations
- ❤️ **Favorites System** - Mark and manage your favorite songs with optimistic UI updates
- 📚 **Playlist Management** - Create, edit, and organize custom playlists
- 💿 **Album Browsing** - Explore music organized by albums
- 🔐 **User Authentication** - Secure login and registration with bcrypt password hashing
- 🎨 **Cover Image Upload** - Upload custom cover images for songs
- 📱 **Responsive Design** - Fully responsive UI built with Tailwind CSS
- 🕒 **Live Clock** - Real-time date and time display in the player
- 🎵 **Now Playing View** - Full-screen immersive music experience

### Admin Features
- 🛠️ **Admin Panel** - Comprehensive dashboard for content management
- ➕ **Song Upload** - Add new songs with metadata and cover images
- 📝 **Content Management** - Edit and delete songs, playlists, and albums
- 🖼️ **Image Management** - Upload and manage cover artwork
- 🔄 **Sync Tools** - Scripts to synchronize playlist and song cover images

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI library
- **Vite 7.2.4** - Build tool and dev server
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **React Router DOM 7.13.0** - Client-side routing
- **Axios 1.13.4** - HTTP client for API requests
- **Framer Motion 12.33.0** - Animation library
- **Lucide React 0.563.0** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.2.1** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 9.1.6** - MongoDB ODM
- **bcryptjs 3.0.3** - Password hashing
- **Multer 2.0.2** - File upload middleware
- **CORS 2.8.6** - Cross-origin resource sharing
- **dotenv 17.2.3** - Environment variable management

---

## 📁 Project Structure

```
MusicPlayerPRO/
├── backend/
│   ├── models/              # Mongoose schemas
│   │   ├── User.js         # User model with favorites
│   │   ├── Song.js         # Song model
│   │   ├── Playlist.js     # Playlist model
│   │   └── Album.js        # Album model
│   ├── routes/             # API route handlers
│   │   ├── auth.js         # Authentication routes
│   │   ├── songs.js        # Song CRUD operations
│   │   ├── playlists.js    # Playlist management
│   │   ├── albums.js       # Album operations
│   │   ├── admin.js        # Admin panel routes
│   │   └── user.js         # User profile & favorites
│   ├── uploads/            # Uploaded files (audio & images)
│   ├── utils/              # Utility functions
│   ├── .env                # Environment variables (NOT in git)
│   ├── index.js            # Express server entry point
│   ├── package.json        # Backend dependencies
│   └── sync_*.js           # Utility scripts for data sync
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context providers
│   │   ├── assets/         # Static assets
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** account (MongoDB Atlas recommended)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MusicPlayerPRO
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set Up Environment Variables**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ```

5. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:3000`

6. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

7. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `PORT` | Backend server port | `3000` |

**⚠️ IMPORTANT:** Never commit your `.env` file to Git. It contains sensitive information like database credentials.

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Songs
- `GET /api/songs` - Get all songs
- `GET /api/songs/:id` - Get song by ID
- `POST /api/songs` - Create new song (Admin)
- `PUT /api/songs/:id` - Update song (Admin)
- `DELETE /api/songs/:id` - Delete song (Admin)

### Playlists
- `GET /api/playlists` - Get all playlists
- `GET /api/playlists/:id` - Get playlist by ID
- `POST /api/playlists` - Create playlist
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist

### Albums
- `GET /api/albums` - Get all albums
- `GET /api/albums/:id` - Get album by ID
- `POST /api/albums` - Create album (Admin)
- `PUT /api/albums/:id` - Update album (Admin)
- `DELETE /api/albums/:id` - Delete album (Admin)

### User
- `GET /api/user/favorites` - Get user's favorite songs
- `POST /api/user/favorites/:songId` - Add song to favorites
- `DELETE /api/user/favorites/:songId` - Remove song from favorites

### Admin
- `POST /api/admin/upload/song` - Upload song file
- `POST /api/admin/upload/image` - Upload cover image

---

## 🚀 Deployment

### Deploying to Vercel

The project is already configured for a monorepo deployment on **Vercel**.

1.  **Connect to GitHub**: Push your code to a GitHub repository.
2.  **Import to Vercel**: Connect your repo to Vercel.
3.  **Configure Settings**: 
    -   Vercel will detect the `vercel.json` and handle routing.
    -   Go to **Environment Variables** in the Vercel dashboard and add:
        -   `MONGO_URI`: Your MongoDB connection string.
        -   `NODE_ENV`: `production`
4.  **Deploy**: Click deploy.

**⚠️ Note on File Uploads**: 
Vercel serverless functions have a read-only filesystem. For the **Admin Panel** uploads to work in production, ensure you are using a cloud storage provider (like **Google Cloud Storage**) rather than local disk storage.

---

## 🧠 How It Works

### Architecture Overview

MusicPlayerPRO follows a **three-tier architecture**:

1. **Client Layer (Frontend)**
   - React-based SPA with Vite for fast development
   - Tailwind CSS for responsive, utility-first styling
   - React Router for client-side navigation
   - Axios for API communication
   - Context API for global state management (user, player state)

2. **Application Layer (Backend)**
   - Express.js REST API server
   - JWT-free authentication using bcrypt for password hashing
   - Multer middleware for handling file uploads
   - CORS enabled for cross-origin requests
   - Static file serving for uploaded audio and images

3. **Data Layer (Database)**
   - MongoDB for document storage
   - Mongoose ODM for schema validation and queries
   - Collections: Users, Songs, Playlists, Albums

### Key Workflows

#### 1. User Authentication Flow
```
User → Register/Login → Backend validates → Password hashed with bcrypt → 
User document created/verified → Session established → User data returned
```

#### 2. Music Playback Flow
```
User selects song → Frontend requests song data → Backend retrieves from MongoDB → 
Returns song metadata + audio URL → Frontend audio player streams from /uploads
```

#### 3. Favorites System
```
User clicks favorite → Optimistic UI update (instant feedback) → 
POST /api/user/favorites/:songId → Backend updates User.favoriteSongs array → 
Confirmation returned → UI syncs with server state
```

#### 4. File Upload Flow (Admin)
```
Admin uploads file → Multer middleware processes → File saved to /uploads → 
File path stored in MongoDB → Public URL generated → 
Frontend can access via http://localhost:3000/uploads/filename
```

### Database Schema

#### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  favoriteSongs: [ObjectId], // References to Song documents
  createdAt: Date
}
```

#### Song Model
```javascript
{
  title: String,
  artist: String,
  album: ObjectId,
  duration: Number,
  audioUrl: String,
  coverImage: String,
  genre: String,
  createdAt: Date
}
```

#### Playlist Model
```javascript
{
  name: String,
  description: String,
  songs: [ObjectId],
  coverImage: String,
  createdBy: ObjectId,
  createdAt: Date
}
```

### Frontend State Management

- **AuthContext** - Manages user authentication state
- **PlayerContext** - Manages current song, playback state, queue
- **Local Component State** - UI-specific state (modals, forms, etc.)

### Styling System

The app uses a **wave-styled design** with:
- Custom CSS animations for wavy progress bars
- Glassmorphism effects for panels
- Gradient backgrounds
- Smooth transitions and hover effects
- Responsive breakpoints for mobile/tablet/desktop

---

## 💻 Development

### Running in Development Mode

**Backend (with auto-reload):**
```bash
cd backend
npm run dev
```

**Frontend (with HMR):**
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```
This creates an optimized production build in `frontend/dist/`

**Backend:**
```bash
cd backend
npm start
```

### Utility Scripts

The backend includes several utility scripts:

- `sync_song_covers.js` - Sync song covers with playlist covers
- `force_sync_covers.js` - Force synchronization of all covers
- `seedSongs.js` - Seed database with sample songs
- `seedPlaylists.js` - Seed database with sample playlists
- `seedAlbums.js` - Seed database with sample albums

Run with:
```bash
node backend/script_name.js
```

---

## 📜 Scripts

### Backend Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |

### Frontend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- React team for the amazing library
- MongoDB for the flexible database
- Tailwind CSS for the utility-first framework
- All open-source contributors

---

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ by the MusicPlayerPRO Team**
