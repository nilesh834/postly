# 🌐 Postly - Social Media Platform

Postly is a full-stack social media platform built with React on the frontend and Node.js/Express on the backend. The platform allows users to share posts, follow/unfollow each other, and manage their profiles. It also integrates with Cloudinary for image hosting.

## 🚀 Features

- **User Authentication:** Signup, Login, and Logout with JWT-based session management.
- **Image Uploads:** Post images and profile avatars are uploaded to Cloudinary.
- **Follow/Unfollow:** Users can follow/unfollow each other and see posts from people they follow.
- **Feed:** A personalized feed showing posts from the users' followed profiles.
- **Profile Management:** Users can update their profile details, including bio and avatar.
- **Likes:** Users can like/unlike posts.

## 🛠️ Technologies Used

- **Frontend:** React 18, Redux Toolkit, Vite, Axios, React Router DOM
- **Backend:** Node.js, Express, MongoDB + Mongoose, JWT
- **Cloud Storage:** Cloudinary for image uploads
- **Authentication:** JWT and Cookie-based authentication

## ⚙️ Installation

1️⃣ **Clone the repository**

```bash
  git clone https://github.com/nilesh834/postly.git
  cd postly
```

2️⃣ **Backend setup**

```bash
  cd server
  npm install
```

Create a `.env` file in `/server` with:

```env
  MONGO_URI=your_mongodb_uri
  JWT_SECRET=your_jwt_secret
  PORT=4000
  CLIENT_URL=http://localhost:3000

  CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
  CLOUDINARY_API_KEY=your_cloudinary_api_key
  CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Run the server

```bash
  npm run dev
```

3️⃣ **Frontend setup**

```bash
  cd client
  npm install
```

Create a `.env` file in `/client` with:

```env
  VITE_SERVER_BASE_URL=http://localhost:4000
```

Start the frontend:

```bash
  npm run dev
```

## 📡 API Documentation

#### 🔑 Auth Routes

- `POST /auth/signup` - Create a new user (name, email, password).
- `POST /auth/login` - Login and receive a JWT token.
- `POST /auth/logout` - Logout (clears session cookie).

#### 👤 User Routes

- `GET /user/getMyInfo` - Get the current logged-in user's profile.
- `GET /user/getFeedData` - Get posts from users the logged-in user is following.
- `POST /user/follow` - Follow or unfollow a user.
- `POST /user/getUserProfile` - Get a user's profile by userId.
- `PUT /user/` - Update profile info (name, bio, avatar).
- `DELETE /user/` - Delete the current user's profile.

#### 📝 Post Routes

- `POST /posts` - Create a new post with a caption and an image.
- `POST /posts/like` - Like or unlike a post.

## 🖼️ Screenshots

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)

## 💖 Acknowledgements

- [Cloudinary](https://cloudinary.com/) — for image hosting
- [MongoDB](https://www.mongodb.com/) — for database
- [JWT](https://jwt.io/) — for secure authentication
- [React](https://react.dev/) — for UI framework

## 👨‍💻 Authors

**Postly** — Connect. Share. Inspire.
A minimalist social media platform built securely on the MERN stack.
