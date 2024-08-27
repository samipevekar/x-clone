import dotenv from 'dotenv';
import express from "express";
import connectMongoDB from './db/connectMongodb.js';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import cron from 'node-cron'; // Import node-cron for scheduling tasks

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import postRoutes from './routes/post.route.js';
import notificationRoutes from './routes/notification.route.js';
import storyRoutes from "./routes/story.route.js";

import Story from './models/story.model.js'; // Import Story model

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 5000;

const corsConfig = {
    origin: ["https://x-frontend-8xv0.onrender.com", "*", "https://x-frontend-8kh3.onrender.com", "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    credentials: true
};

app.use(cors(corsConfig));

app.options("", cors(corsConfig));

app.use(express.json({ limit: "5mb" })); // to parse req.body
app.use(express.urlencoded({ extended: true })); // to parse form data

app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("hello world");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/story", storyRoutes);

// Schedule a task to run daily at midnight to delete expired stories and their associated images
cron.schedule('0 0 * * *', async () => {
    try {
        const expiredStories = await Story.find({ expiresAt: { $lte: Date.now() } });
        
        for (const story of expiredStories) {
            if (story.img) {
                const imgId = story.img.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(imgId);
            }
            await Story.findByIdAndDelete(story._id);
        }
        
        console.log(`${expiredStories.length} expired stories deleted.`);
    } catch (error) {
        console.error("Error deleting expired stories:", error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});
