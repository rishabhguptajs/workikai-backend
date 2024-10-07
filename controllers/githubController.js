import axios from "axios";
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { reviewPR } from "../services/aiService.js";

export const githubWebhookHandler = async (req, res) => {
    try {
        const payload = req.body;

        if (payload.action === 'opened') {
            const owner = payload.repository.owner.login;
            const repo = payload.repository.name;

            const prData = {
                title: payload.pull_request.title,
                body: payload.pull_request.body,
                changed_files: payload.pull_request.changed_files
            };

            const review = await reviewPR(prData);
            const token = await generateJWT();
            
            const postComment = await postCommentOnPR(owner, repo, payload.pull_request.number, review, token);

            if (postComment.error) {
                return res.status(500).json({ error: "Error posting PR review comment", message: postComment.error });
            } else {
                return res.status(200).json({ message: "PR review comment posted successfully.", data: postComment });
            }
        }

        return res.status(200).json({ message: "PR review comment posted successfully.", data: payload });

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

const postCommentOnPR = async (owner, repo, prNumber, review, token) => {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
    };

    const data = {
        body: review
    };

    const response = await axios.post(url, data, { headers: headers });

    console.log(response.data);

    return response.data;
}