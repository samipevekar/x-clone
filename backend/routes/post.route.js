import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { commentOnPost, createPost, deletePost, getAllPost, repostPost, getLikedPost, likeUnlikePost, getFollowingPosts, getUserPosts, getBookmarkedPosts, bookmarkUnbookmarkPost } from '../controllers/post.controller.js';
import { upload } from '../controllers/post.controller.js'; // Import multer configuration from controller

const router = express.Router();

// Define your routes
router.get("/all", protectRoute, getAllPost);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, getLikedPost);
router.get("/user/:username", protectRoute, getUserPosts);
router.get("/bookmarks", protectRoute, getBookmarkedPosts);
router.post("/bookmark/:id", protectRoute, bookmarkUnbookmarkPost);
router.post("/repost/:id", protectRoute, repostPost);

// Update the createPost route to handle image/audio uploads
router.post("/create", protectRoute, upload, createPost);

router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);

export default router;
