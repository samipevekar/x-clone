// Import necessary models and libraries
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// Controller for getting a user profile by username
export const getUserProfile = async (req, res) => {
    const { username } = req.params;

    try {
        // Find the user by username and exclude password from the result
        const user = await User.findOne({ username }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user); // Respond with the user profile
    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("error in getUserProfile function",error)
    }
};

// Controller for following or unfollowing a user
export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id); // User to be followed/unfollowed
        const currentUser = await User.findById(req.user._id); // Current user

        // Check if the user is trying to follow/unfollow themselves
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You can't follow/unfollow yourself" });
        }

        if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // Unfollow the user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            res.status(200).json({ message: "User unfollowed successfully" });

        } else {
            // Follow the user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

            // Create and save a notification for the follow action
            const notification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id
            });

            await notification.save();

            res.status(200).json({ message: "User followed successfully" });
        }

    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("error in followUnfollowUser function",error)
    }
};

// Controller for getting suggested users for follow
export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get the list of users followed by the current user
        const usersFollowedByMe = await User.findById(userId).select("following");

        // Aggregate and sample users who are not the current user and have not been followed by the current user
        const users = await User.aggregate([
            { $match: { _id: { $ne: userId } } },
            { $sample: { size: 10 } }
        ]);

        const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id));

        // Limit the number of suggested users to 4
        const suggestedUsers = filteredUsers.slice(0, 4);

        // Exclude password field from the response
        suggestedUsers.forEach(user => user.password = null);

        res.status(200).json(suggestedUsers); // Respond with suggested users

    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("error in getSuggestedUsers function",error)
    }
};

// Controller for updating user profile information
export const updateUser = async (req, res) => {
    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;

    const userId = req.user._id;

    try {
        let user = await User.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the new username already exists in the database
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: "Username already exists" });
            }
        }
        // Validate current and new password fields
        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please enter both current and new password to update" });
        }

        // Check and update password if provided
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Current password is incorrect" });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters long" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Upload and update profile and cover images if provided
        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }

        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        // Update user fields with provided values or keep existing values
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        // Save the updated user and exclude password from the response
        user = await user.save();
        user.password = null;

        res.status(200).json(user); // Respond with the updated user profile

    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("error in updateProfile function",error)
    }
};


// get following user
export const getFollowingUser = async(req,res)=>{
    try {
        const userId = req.user._id;

        let user = await User.findById(userId).populate("following","username profileImg")
        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        const followedUsers = user.following.map(followedUser => ({
            id: followedUser._id,
            username: followedUser.username,
            profileImg: followedUser.profileImg
        }));

        res.status(200).json(followedUsers)
        

    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("error in getFollowingUser function",error)
    }
}


// search user
export const searchUser = async(req, res) => {
    try {
        const { user } = req.query;
        
        if (!user) {
            return res.status(400).json({ error: "Query parameter is required" });
        }

        // MongoDB Atlas Search Aggregation Pipeline
        const users = await User.aggregate([
            {
                '$search': {
                    'index': "search-user", // The name of your Atlas Search index
                    'text': {
                        'query': user,
                        'path': {
                           'wildcard': "*" // Search in all fields
                        }
                    }
                }
            }
        ]);

        res.json(users);

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in searchUser function", error);
    }
}
