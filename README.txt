# 🎬 Movie Lovers

A full-stack movie watchlist web app powered by Node.js and MongoDB.  
Search, save, and share your favorite movies with ease. 

Live Demo:http://movie-library-env.eba-iumiwnj2.us-east-2.elasticbeanstalk.com/index.html

**Movie Lovers** is a full-stack web application that allows users to search for movies, create personal watchlists, and share them with the community. Built with Node.js, Express, MongoDB, and Handlebars, this project is designed for both functionality and learning.


---

## Features

- User registration & login with secure session tracking
- Create and manage multiple watchlists
- Browse and save public watchlists from other users
- Search movies and add to your lists
- Save (favorite) public watchlists to your profile
- Remove movies from your lists (owner only)
- Explore and filter community lists (by date and popularity)
- Admin page to view all users (for demonstration)

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Frontend (new)**: React + Vite + React Router + Axios
- **Legacy Views**: Handlebars (.hbs) still available for server-rendered pages
- **Authentication**: express-session (cookie-based sessions)
- **Data Model**: User, Watchlist, Movie (with Mongoose schemas)

---

## Installation

```bash
git clone https://github.com/Katherinelovescoding/Movie-Lovers.git
cd Movie-Lovers
npm install

---
Create a `.env` file in the root directory with the following content:
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_db_name
This connection string is used in `server.js` to connect your app to MongoDB Atlas or your local MongoDB database.


Test URLs
Register: localhost:3000/register
Login: localhost:3000/login
Main: localhost:3000/index.html
Admin: localhost:3000/users

Demo Account
username: ginger
password: 123456


---

## Future Improvements (Planned)
- Show how many users have saved a public watchlist
- Add user ratings/comments for movies
- OAuth login (Google/GitHub)
- Responsive mobile layout
- Public discussion section


---

## About Me
I’m a 4th-year Computer Science student at Carleton University specializing in AI/ML.
This project showcases my full-stack development skills, MongoDB integration, RESTful API thinking, and passion for building useful, user-friendly applications.
