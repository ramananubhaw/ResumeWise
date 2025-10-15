import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.ts";
import authRoutes from "./routes/auth.routes.ts";
import screeningRoutes from "./routes/screening.routes.ts";
import cookieParser from "cookie-parser";

dotenv.config();

const allowedOrigins = [
  process.env.CLIENT_DEV_URL || "http://localhost:5173",
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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});