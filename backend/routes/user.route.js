import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUser, getFollowingUser } from "../controllers/user.controller.js"

const router = express.Router()

router.get("/profile/:username",protectRoute,getUserProfile)
router.get("/suggested",protectRoute,getSuggestedUsers)
router.get("/followinguser",protectRoute,getFollowingUser)
router.post("/follow/:id",protectRoute,followUnfollowUser)
router.post("/update",protectRoute,updateUser)

export default router