import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/router.ts";

dotenv.config();

const allowedOrigins = [
  process.env.CLIENT_DEV_URL || "http://localhost:5173",
];

const corsOptions = {
  origin: allowedOrigins, // Allow all origins for simplicity; adjust as needed for security
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("<h1>Welcome to ResumeWise Server</h1>");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});