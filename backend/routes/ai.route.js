import express from "express";
import { chatBot } from "../controllers/ai.controller.js";

const router = express.Router()

router.get('/chat/:query',chatBot)


export default router