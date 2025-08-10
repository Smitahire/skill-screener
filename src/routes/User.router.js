import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewear.js";
import { login, logout, registerUser } from "../controllers/User.controller.js";

const router = Router();

router.route('/register').post(registerUser)
router.route('/login').post(login)
router.route('/logout').post(verifyJWT, logout)

export default router