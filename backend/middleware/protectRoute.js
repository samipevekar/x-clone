import jwt from 'jsonwebtoken';

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
    // Get the token from the 'auth-token' header
    const token = req.header('auth-token');
    
    // Check if no token is provided
    if (!token) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }

    try {
        // Verify the token
        const data = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add the user data to the request object
        req.user = data
        
        // Proceed to the next middleware/route handler
        next();
    } catch (error) {
        // If token is invalid, return an error
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }
}
