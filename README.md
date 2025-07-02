# Movies App

A full-stack movies web application with user authentication, movie/TV search, trending section, and favorites, built with React (frontend) and Node.js/Express/MongoDB (backend).

## Features

- User registration and login (JWT authentication)
- Search for movies and TV shows
- Trending movies/TV shows section
- Movie/TV show details with trailers
- Responsive, modern UI (Tailwind CSS)
- Favorites and search history (backend)
- MongoDB Atlas integration

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Authentication:** JWT
- **API:** TMDB

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/movies-app.git
   cd movies-app
   ```

2. **Backend setup:**
   ```sh
   cd backend
   npm install
   # Create a .env file with your MongoDB URI and JWT secret
   npm run dev
   ```

3. **Frontend setup:**
   ```sh
   cd ../frontend
   npm install
   # Create a .env file with your TMDB API key
   npm run dev
   ```

### Environment Variables

#### Backend (`backend/.env`)
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

#### Frontend (`frontend/.env`)
```
VITE_TMDB_API_KEY=your_tmdb_api_key
```

## Usage

- Visit the frontend URL (default: `http://localhost:5173`)
- Register or log in
- Search, browse, and view movie/TV details