import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { createStory, getStoryById, deleteStory,getStoriesByUserId, getUserStory, getFollowingStories } from "../controllers/story.controller.js"

const router = express.Router()

router.get('/stories/:id',protectRoute,getStoryById)
router.get('/mystory',protectRoute,getUserStory)
router.get('/followingstories',protectRoute,getFollowingStories)
router.get('/userstory/:userId',protectRoute,getStoriesByUserId)
router.post('/create',protectRoute,createStory)
router.delete('/stories/:id',protectRoute,deleteStory)

export default router