import axios from "axios";
import crypto from 'crypto'
import { reviewPR } from "../services/aiService.js";

export const githubWebhookHandler = async(req, res) => {
    try {
        const payload = req.body;
        const signature = req.headers['x-hub-signature-256'];

        const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
        const digest = Buffer.from('sha256=' + hmac.update(JSON.stringify(payload)).digest('hex'), 'utf8');

        if(signature !== digest.toString('utf8')){
            return res.status(401).json({ error: "Invalid signature" });
        }

        if(payload.action === 'opened'){
            const prData = {
                title: payload.pull_request.title,
                body: payload.pull_request.body,
                changed_files: payload.pull_request.changed_files
            };

            const review = await reviewPR(prData);

            return res.status(200).json({ review });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error", message: error });
    }
}