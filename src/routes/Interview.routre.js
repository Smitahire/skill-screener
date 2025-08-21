import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewear.js";
import { evaluateAnswers, finalEvaluation, generateInterview, generateQuestionsForAnswer, submitAnswer } from "../controllers/Interview.controller.js";


const router = Router();

// post routes
router.route('/generate-interview').post(verifyJWT, generateInterview)
router.route('/generate-questions').post(verifyJWT, generateQuestionsForAnswer)
router.route('/submit-answer').post(verifyJWT, submitAnswer)
router.route('/evaluate-answers').post(verifyJWT, evaluateAnswers)
router.route('/final-evaluation').post(verifyJWT, finalEvaluation)


export default router
