import axios from "axios";
import User from "../models/User.js";
import querystring from "querystring"; // To parse URL-encoded responses

export const githubAuthCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: "No code provided" });
    }

    try {
        console.log({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code
        });

        const response = await axios.post(
            `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`,
            {
                headers: {
                    accept: "application/json"
                }
            }
        );

        const parsedData = querystring.parse(response.data);

        const { access_token } = parsedData;

        if (!access_token) {
            return res.status(400).json({ error: "Failed to get access token" });
        }

        const user = new User({ 
            githubAccessToken: access_token,
         });
        await user.save();

        return res.status(200).json({ token: access_token, user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error", message: error });
    }
};
