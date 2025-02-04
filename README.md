# Tweet Wave - An X (Twitter) Clone

Tweet Wave is a **feature-rich X (formerly Twitter) clone** that provides a seamless social media experience with additional functionalities like **story uploads** and more unique features coming soon. Built with **MERN stack**, it leverages **Cloudinary** for efficient image storage.

## 🚀 Live Demo

🔗 **Live Website:** [Tweet Wave](https://x-frontend-kuz7.onrender.com/)

---

## 📌 Features

### User Features:
- **Post tweets** with text and images.
- **Upload stories** that disappear after a set time.
- **Like, comment, and retweet** functionalities.
- **Follow/unfollow users** to curate your timeline.
- **Real-time updates** via WebSockets.
- **User authentication** (Signup/Login/Logout).

### Upcoming Features:
- **Direct Messaging (DMs)**
- **Push Notifications**
- **Dark Mode Support**
- **More AI-powered recommendations**

---

## 🛠️ Tech Stack

### Frontend:
- **React.js** (Vite for performance)
- **Tailwind CSS & DaisyUI** (for modern styling)
- **React Router** (for seamless navigation)

### Backend:
- **Node.js** & **Express.js** (REST API)
- **MongoDB** & **Mongoose** (Database & ORM)
- **JWT Authentication** (for secure access control)
- **Cloudinary API** (for image storage)
- **Socket.io** (for real-time interactions)

### Deployment:
- **Frontend:** Render
- **Backend:** Render / Railway / DigitalOcean
- **Database:** MongoDB Atlas

---

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/samipevekar/x-clone.git
   cd x-clone
   ```

2. **Backend Setup**
   ```sh
   cd backend
   npm install
   npm start
   ```

3. **Frontend Setup**
   ```sh
   cd frontend
   npm install
   npm run dev
   ```

4. **Environment Variables**
   Create a `.env` file in the root of the backend directory and add:
   ```env
   MONGODB_URL=your_mongodb_connection_string
   PORT = 8080
   NODE_ENV = production
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   GEMINI_API_KEY = your_gemini_api_key
   ```
