import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewear.js";
import { uploadResume } from "../controllers/Resume.controller.js";
import { upload } from "../middlewares/multer.middlewear.js";

const router = Router();

router.route('/upload-resume').post(verifyJWT,upload.single('resumePdf'),uploadResume)


export default router