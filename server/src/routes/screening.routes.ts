import { Router } from "express";
import multer from "multer";
import screeningController from "../controllers/screening.controllers.ts";
import { verifyToken } from "../middlewares/auth.middleware.ts";

const router = Router();

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

/* * POST /api/screen
 * Handles the core screening process.
 * Expects 'multipart/form-data' which contains:
 * - 'resume' (file) OR 'resumeText' (field)
 * - 'jobDescription' (file) OR 'jobDescriptionText' (field)
 */
router.post(
    '/screen',
    verifyToken,
    // Multer handles two file fields (resume and jobDescription) and the text fields
    upload.fields([
        { name: 'resume', maxCount: 1 },
        { name: 'jobDescription', maxCount: 1 },
    ]),
    screeningController.screenCandidate
);

export default router;