import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewear.js";
import { evaluateAnswers, generateInterview, generateQuestionsForAnswer, submitAnswer } from "../controllers/Interview.controller.js";


const router = Router();


router.route('/generate-interview').post(verifyJWT, generateInterview)
router.route('/generate-questions').post(verifyJWT, generateQuestionsForAnswer)
router.route('/submit-answer').post(verifyJWT, submitAnswer)
router.route('/evaluate-answers').post(verifyJWT, evaluateAnswers)


export default router
