import express from 'express'
import { githubWebhookHandler } from '../controllers/githubController.js';

const router = express.Router()

router.post('/', githubWebhookHandler);

export default router