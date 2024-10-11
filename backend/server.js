import dotenv from 'dotenv';
import express from "express";
import connectMongoDB from './db/connectMongodb.js';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import cron from 'node-cron'; // Import node-cron for scheduling tasks
import compression from 'compression'; 


import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import postRoutes from './routes/post.route.js';
import notificationRoutes from './routes/notification.route.js';
import storyRoutes from "./routes/story.route.js";
import chatRoutes from "./routes/ai.route.js"

import Story from './models/story.model.js'; // Import Story model
import axios from 'axios';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 5000;

const corsConfig = {
    origin: ["https://x-frontend-kuz7.onrender.com","http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    credentials: true
    
};

app.use(cors(corsConfig));

app.use(compression());

app.use(express.json({ limit: "20mb" })); // to parse req.body
app.use(express.urlencoded({ extended: true })); // d to parse form data  


app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("hello world");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/story", storyRoutes);
app.use("/api/ai", chatRoutes)

cron.schedule('*/4 * * * *', async () => {
    try {
        const response = await axios.get(`${ 'https://x-backend-ujvu.onrender.com' || `http://localhost:${PORT}`}/`, {
            family: 4  // Force IPv4
        });
        console.log('Pinged the server:', response.data);
    } catch (error) {
        console.error('Error pinging the server:', error.message);
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});
