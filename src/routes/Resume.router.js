import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewear.js";
import { uploadResume } from "../controllers/Resume.controller.js";


const router = Router();

router.route('/upload-resume').post(verifyJWT,uploadResume)


export default router