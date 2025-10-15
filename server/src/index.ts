import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import screeningRoutes from "./routes/screening.routes.js";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import axios from "axios";
// import { set } from "mongoose";

dotenv.config();

const allowedOrigins = [
  process.env.CLIENT_DEV_URL || "http://localhost:5173",
  process.env.CLIENT_PROD_URL || "http://localhost:5173"
];

const corsOptions = {
  origin: allowedOrigins, // Allow all origins for simplicity; adjust as needed for security
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true, // Allow cookies to be sent
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api', screeningRoutes);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("<h1>Welcome to ResumeWise Server</h1>");
});

const setupCronJobs = () => {
  console.log('Setting up scheduled jobs...');
  
  // Schedule a job to run every 15 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log(`[Cron] Pinging services at ${new Date().toLocaleString()}`);
    
    // 1. Ping the Express Server (Self)
    try {
      const serverRes = await axios.get(`http://localhost:${PORT}`);
      console.log(`[Cron] Server ping successful. Status: ${serverRes.status}`);
    } catch (e) {
      console.error(`[Cron] Error pinging server at ${`http://localhost:${PORT}`}`);
    }

    // 2. Ping the Client URL (Frontend)
    try {
      const clientRes = await axios.get(process.env.CLIENT_PROD_URL || 'http://localhost:5173');
      console.log(`[Cron] Client ping successful. Status: ${clientRes.status}`);
    } catch (e) {
      console.error(`[Cron] Error pinging client at ${process.env.CLIENT_PROD_URL || 'http://localhost:5173'}`);
    }
  });
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    setupCronJobs();
  });
});