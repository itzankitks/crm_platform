import { Router } from "express";
import {
  googleLogin,
  googleSignup,
  login,
  register,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/google-signup", googleSignup);

export default router;
