import express from "express";
import { githubAuthCallback } from "../controllers/authController.js";

const router = express.Router();

router.get("/github/callback", githubAuthCallback);

export default router;