import mongoose from "mongoose";
import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";


// create sotry
export const createStory = async(req,res)=>{
    try {
        const {text} = req.body
        let {img} = req.body;
        const userId = req.user._id.toString();

        // check if user exist
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        // check if user already created the story
        // const story = await Story.find({user:userId})
        // if(story){
        //     return res.status(400).json({message:"You have already created a story"})
        // }

        // check either img or text exist
        if(!text && !img){
            return res.status(400).json({message:"Either img or text is required"})
        }

        // add img to cloudinary
        if (img) {
            try {
                const uploadedResponse = await cloudinary.uploader.upload(img);
                console.log("Uploaded img URL:", uploadedResponse.secure_url);
                img = uploadedResponse.secure_url;
            } catch (uploadError) {
                console.log("Error uploading image to Cloudinary:", uploadError);
                return res.status(500).json({ message: "Image upload failed" });
            }
        }

        // save to db
        const newStory = new Story({
            user:userId,
            img,
            text,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000
        })

        await newStory.save()
        res.status(201).json(newStory)
        
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in createStory function", error);
    }
}


// get sotry by their id
export const getStoryById = async(req,res)=>{
    try {
        const storyId = req.params.id;

        const story = await Story.findById(storyId)
        if(!story){
            return res.status(404).json({message:"Story not found"})
        }

        res.status(200).json(story)
        
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in getStoryById function", error);
    }
}

// get all stories by userId
export const getStoriesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate the userId
        if (!userId || !mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        // Fetch all stories by userId
        const stories = await Story.find({ user: userId }).populate("user","username profileImg")

        if (!stories) {
            return res.status(404).json({ message: "No stories found for this user" });
        }

        res.status(200).json(stories);

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in getStoriesByUserId function", error);
    }
};


// delete story
export const deleteStory = async(req,res)=>{
    try {
        const storyId = req.params.id
        const userId = req.user._id
    
        const story = await Story.findById(storyId)
        if(!story){
            return res.status(404).json({message:"Story not found"})
        }
    
        if(story.user.toString() !== userId.toString()){
            return res.status(401).json({ error: "You can only delete your own story" });
        }
    
        if(story.img){
            const imgId = story.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)
    
        }
    
        await Story.findByIdAndDelete(storyId)
        res.status(200).json({ message: "Story deleted successfully" });
        
        
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in deleteStory function", error);
    }


}

// get authenticated user story
export const getUserStory = async(req,res)=>{
    try {
        const userId = req.user._id
        const story = await Story.find({user:userId}).populate("user","profileImg username")
        if(!story){
            return res.status(404).json({message:"No story found"})
        }
        res.status(200).json(story)
        
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in getUserStory function", error);
    }
}

// get following stories
export const getFollowingStories = async(req,res)=>{
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate('following')
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Extract the list of followed users' IDs
        const followedUserIds = user.following.map(followedUser=>followedUser._id)

        // Find stories created by followed users
        const stories = await Story.find({ user: { $in: followedUserIds } }).sort({ createdAt: -1 }).populate('user');

        res.status(200).json(stories)
        
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in getFollowingStories function", error);
    }
}