import { Router } from "express";
import verifyJWT from "src/middlewares/auth.middlewear";
import { login, logout, registerUser } from "src/controllers/user.controller.js";



const router = Router();

router.route('/register').post(registerUser)
router.route('/login').post(login)
router.route('/logout').post(verifyJWT, logout)

export default router