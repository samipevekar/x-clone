// Import necessary models and libraries
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";

// Controller for creating a post
export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure the post has either text or an image
        if (!text && !img) {
            return res.status(400).json({ message: "Post must have either text or image" });
        }

        // Upload the image to Cloudinary if it exists
        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        // Create a new post
        const newPost = new Post({
            user: userId,
            text,
            img
        });

        await newPost.save(); // Save the new post to the database
        res.status(201).json(newPost); // Respond with the new post

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in createPost function", error);
    }
};

// Controller for deleting a post
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Ensure the user is authorized to delete the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "You can only delete your own post" });
        }

        // Delete the image from Cloudinary if it exists
        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id); // Delete the post
        res.status(200).json({ message: "Post deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in deletePost function", error);
    }
};

// Controller for commenting on a post
export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        // Ensure the comment text is provided
        if (!text) {
            return res.status(400).json({ error: "Please enter a comment" });
        }

        const post = await Post.findById(postId);

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = { user: userId, text };

        post.comments.push(comment); // Add the comment to the post
        await post.save(); // Save the post

        res.status(200).json(post); // Respond with the updated post

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in commentOnPost function", error);
    }
};

// Controller for liking or unliking a post
export const likeUnlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        let post = await Post.findById(postId);

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if the post is already liked by the user
        let isLiked = await post.likes.includes(userId);

        if (isLiked) {
            // Unlike the post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } }); // Remove the post from user's liked posts

            const updatedLikes = post.likes.filter((id)=> id.toString() !== userId.toString())
            res.status(200).json(updatedLikes);

        } else {
            // Like the post
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } }); // Add the post to user's liked posts
            await post.save();

            // Create a notification for the like
            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like",
            });

            await notification.save(); // Save the notification

            const updatedLikes = post.likes
            res.status(200).json(updatedLikes);
        }

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in likeUnlikePost function", error);
    }
};

// Controller for getting all posts
export const getAllPost = async (req, res) => {
    try {
        // Find all posts and sort by creation date in descending order
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        if (posts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(posts); // Respond with all posts

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in getAllPost function", error);
    }
};

// Controller for getting liked posts of a user
export const getLikedPost = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find all posts liked by the user
        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(likedPosts); // Respond with liked posts

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in getLikedPosts function", error);
    }
};

// Controller for getting posts of the users followed by the current user
export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const following = user.following;

        // Find all posts from the users followed by the current user
        const feedPosts = await Post.find({ user: { $in: following } })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comments.user",
                select: "-password"
            });

        res.status(200).json(feedPosts); // Respond with the feed posts

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in getFollowingPosts function", error);
    }
};

// Controller for getting posts of a specific user by username
export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find all posts by the user and sort by creation date in descending order
        const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comments.user",
                select: "-password"
            });

        res.status(200).json(posts); // Respond with the user's posts

    } catch (error) {
        res.status500.json({ error: "Internal server error" });
        console.log("Error in getUserPosts function", error);
    }
};
