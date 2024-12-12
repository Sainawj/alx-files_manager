# Authentication with Node.js, MongoDB, Redis & Pagination

This project demonstrates authentication, data storage, caching, and background processing using **Node.js**, **MongoDB**, **Redis**, and **pagination**. It includes secure user authentication, caching with Redis, efficient data retrieval via pagination, and background task processing.

## Features
- **User Authentication** with JWT
- **MongoDB** for data storage
- **Redis** for caching and background tasks
- **Pagination** for efficient data retrieval

## Installation
1. Clone the repository and install dependencies: `npm install`
2. Set up `.env` for MongoDB and Redis configurations.
3. Start the app: `npm start`

## API Endpoints
- `/auth/signup` - User registration
- `/auth/login` - User login
- `/users` - Get paginated list of users
