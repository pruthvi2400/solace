import express from "express";
import { register, login, getMe, logout } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { body } from "express-validator";

const router = express.Router();

router.post("/register", [
  body("name", "Please add a name").notEmpty(),
  body("email", "Please include a valid email").isEmail(),
  body("password", "Please enter a password with 6 or more characters").isLength({ min: 6 }),
], register);
router.post("/login", [
  body("email", "Please include a valid email").isEmail(),
  body("password", "Password is required").exists(),
], login);
router.get("/me", protect, getMe);
router.get("/logout", logout);

export default router;
