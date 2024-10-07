import axios from "axios";
import crypto from 'crypto';
import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'url'
import { reviewPR } from "../services/aiService.js";

export const githubWebhookHandler = async (req, res) => {
export const githubWebhookHandler = async (req, res) => {
    try {
        const payload = req.body;
        const signature = req.headers['x-hub-signature-256'];

        const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
        const digest = Buffer.from('sha256=' + hmac.update(JSON.stringify(payload)).digest('hex'), 'utf8');

        if (signature !== digest.toString('utf8')) {
        if (signature !== digest.toString('utf8')) {
            return res.status(401).json({ error: "Invalid signature" });
        }

        const owner = payload.repository.owner.login;
        const repo = payload.repository.name;

        if (payload.action === 'opened') {
        const owner = payload.repository.owner.login;
        const repo = payload.repository.name;

        if (payload.action === 'opened') {
            const prData = {
                title: payload.pull_request.title,
                body: payload.pull_request.body,
                changed_files: payload.pull_request.changed_files
            };

            const review = await reviewPR(prData);
            const token = await generateJWT();

            await axios.post(
                `https://api.github.com/repos/${owner}/${repo}/pulls/${payload.pull_request.number}/comments`,
                {
                    body: review.choices[0].message.content
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/vnd.github.v3+json"
                    }
                }
            );
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error", message: error });
    }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateJWT = () => {
    const privateKey = fs.readFileSync(path.join(__dirname, 'workikai.2024-10-06.private-key.pem'));
    return jwt.sign(
        {
            iat: Math.floor(Date.now() / 1000) - 60,
            exp: Math.floor(Date.now() / 1000) + 60 * 10,
            iss: process.env.GITHUB_CLIENT_ID
        },
        privateKey,
        { algorithm: 'RS256' }
    );
};
