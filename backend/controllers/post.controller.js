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

        const notification = new Notification({
            from: userId,
            to: post.user,
            type: "comment",
        })

        await notification.save()

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
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        }).populate({
            path: "originalPost",
            populate: {
                path: "user",
                select: "username fullName profileImg"
            }
        });

        const updatedPosts = posts.map(post => {
            if (post.repost && post.originalPost) {
                // Reflect likes and comments from the original post
                post.likes = post.originalPost.likes;
                post.comments = post.originalPost.comments;
            }
            return post;
        });

        res.status(200).json(updatedPosts);

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

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comments.user",
                select: "-password"
            })
            .populate({
                path: "originalPost",
                populate: {
                    path: "user",
                    select: "username fullName profileImg"
                }
            });

        const updatedPosts = likedPosts.map(post => {
            if (post.repost && post.originalPost) {
                post.likes = post.originalPost.likes;
                post.comments = post.originalPost.comments;
            }
            return post;
        });

        res.status(200).json(updatedPosts);

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

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const following = user.following;

        const feedPosts = await Post.find({ user: { $in: following } })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comments.user",
                select: "-password"
            })
            .populate({
                path: "originalPost",
                populate: {
                    path: "user",
                    select: "username fullName profileImg"
                }
            });

        const updatedPosts = feedPosts.map(post => {
            if (post.repost && post.originalPost) {
                post.likes = post.originalPost.likes;
                post.comments = post.originalPost.comments;
            }
            return post;
        });

        res.status(200).json(updatedPosts);

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

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comments.user",
                select: "-password"
            })
            .populate({
                path: "originalPost",
                populate: {
                    path: "user",
                    select: "username fullName profileImg"
                }
            });

        const updatedPosts = posts.map(post => {
            if (post.repost && post.originalPost) {
                post.likes = post.originalPost.likes;
                post.comments = post.originalPost.comments;
            }
            return post;
        });

        res.status(200).json(updatedPosts);

    } catch (error) {
        res.status500.json({ error: "Internal server error" });
        console.log("Error in getUserPosts function", error);
    }
};


// Controller for bookmarking or unbookmarking a post
export const bookmarkUnbookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId).populate({
            path: "originalPost",
            populate: {
                path: "user",
                select: "username fullName profileImg" // Select the fields you want from the original post's user
            }
        });
        if(!post){
            return res.status(404).json({error: "Post not found"})
        }

        const user = await User.findById(userId);

        // Check if the post is already bookmarked by the user
        let isBookmarked = user.bookmarkedPosts.includes(postId);

        if (isBookmarked) {
            // Unbookmark the post
            user.bookmarkedPosts.pull(postId);
            res.status(200).json({ message: "Post unbookmarked successfully" });
        } else {
            // Bookmark the post
            user.bookmarkedPosts.push(postId);
            res.status(200).json({ message: "Post bookmarked successfully" });
        }

        await user.save(); // Save the user with the updated bookmarked posts

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in bookmarkUnbookmarkPost function", error);
    }
};



// Controller for getting bookmarked posts of the logged-in user
export const getBookmarkedPosts = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate({
            path: "bookmarkedPosts",
            populate: [
                {
                    path: "user", // Populate the user who created the post
                    select: "-password"
                },
                {
                    path: "comments.user", // Populate the user who commented on the post
                    select: "-password"
                }
            ]
        });

        res.status(200).json(user.bookmarkedPosts); // Respond with bookmarked posts

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in getBookmarkedPosts function", error);
    }
};


// controller to repostPost
export const repostPost = async (req, res) => {
    try {
        const postId = req.params.id; // ID of the post to be reposted
        const userId = req.user._id; // ID of the user who is reposting

        // Check if the user has already reposted this post
        const existingRepost = await Post.findOne({ user: userId, originalPost: postId, repost: true });

        if (existingRepost) {
            // If the repost exists, delete it
            await Post.findByIdAndDelete(existingRepost._id);
            return res.status(200).json({ message: "Repost removed successfully" });
        }

        // Find the original post
        const originalPost = await Post.findById(postId).populate({
            path:"user",
            select:"-password"
        }); // Populate with username and name;

        if (!originalPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Create a new repost (reference to the original post)
        const newRepost = new Post({
            user: userId,
            repost: true,
            originalPost: postId
        });

        await newRepost.save();

        res.status(200).json({ 
            message: "Post reposted successfully", 
            repost: newRepost
        });

    } catch (error) {
        console.error("Error in repostPost function", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
