import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'

// Signup controller
export const signup = async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;

        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Check password length
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Create new user instance
        const newUser = new User({
            fullName,
            username,
            email,
            password: hashPassword
        });

        await newUser.save(); // Save the new user to the database

        // Generate token
        const userId = newUser._id
        const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET);
        // Change this to return token instead of setting cookie

        // Respond with the token and user details
        res.status(201).json({
            token,
            user: {
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg
            }
        });

    } catch (error) {
        console.log("Error in signup controller", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Login controller
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });

        // Check if the password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Generate token
        const userId = user._id
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);


        // Respond with the token and user details
        res.status(200).json({
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImg: user.profileImg,
                coverImg: user.coverImg
            }
        });

    } catch (error) {
        console.log("Error in login controller", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Logout controller
export const logout = async (req, res) => {
    try {
        // Inform the client to remove the token
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get current user (profile) controller
export const getMe = async(req, res) => {
    try {
        // Find the user by ID and exclude the password field from the result
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
