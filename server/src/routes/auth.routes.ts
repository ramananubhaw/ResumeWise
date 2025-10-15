import { Router } from "express";
import authController from "../controllers/auth.controllers.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/logout', verifyToken, authController.logout);
router.get('/user', verifyToken, authController.user);

export default router;