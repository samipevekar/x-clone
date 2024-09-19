import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { followUnfollowUser, getSuggestedUsers,getFollowers, getUserProfile, updateUser, getFollowingUser, searchUser } from "../controllers/user.controller.js"

const router = express.Router()

router.get("/profile/:username",protectRoute,getUserProfile)
router.get("/suggested",protectRoute,getSuggestedUsers)
router.get("/followinguser",protectRoute,getFollowingUser)
router.get("/followers",protectRoute,getFollowers)
router.get("/search",protectRoute,searchUser)
router.post("/follow/:id",protectRoute,followUnfollowUser)
router.post("/update",protectRoute,updateUser)


export default router