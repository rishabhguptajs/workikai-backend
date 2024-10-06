import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    githubAccessToken: {
        type: String,
        required: true
    }
})

const User = mongoose.model('User', userSchema)

export default User