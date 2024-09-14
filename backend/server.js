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
    origin: ["https://x-frontend-kuz7.onrender.com","http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    credentials: true
    
};

app.use(cors(corsConfig));

app.use(compression());

app.use(express.json({ limit: "20mb" })); // to parse req.body
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
    console.log('Running a task daily at midnight to clean up expired stories');
    try {
        // Get the current time
        const now = Date.now();

        // Find all expired stories
        const expiredStories = await Story.find({ expiresAt: { $lt: now } });

        // Loop through each expired story
        for (const story of expiredStories) {
            // If the story has an image, delete it from Cloudinary
            if (story.img) {
                const imgId = story.img.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(imgId);
            }

            // Delete the story from the database
            await Story.findByIdAndDelete(story._id);
        }

        console.log('Expired stories cleaned up successfully');
    } catch (error) {
        console.error('Error cleaning up expired stories:', error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});
