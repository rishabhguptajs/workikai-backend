import express from "express";
import cors from 'cors'
import dotenv from "dotenv";
import connectDB from "./config.js";
import authRoutes from "./routes/authRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

const app = express();

dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running')
})

app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
});