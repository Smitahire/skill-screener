import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewear.js";
import { createJob, getJobs, getMyPostedJobs } from "../controllers/Job.controller.js";



const router = Router();

router.route('/create-job').post(verifyJWT,createJob)

// user endpoint
router.route('/get-jobs').get(getJobs)

//recruiter dashbord
router.route('/get-my-posted-job').get(verifyJWT,getMyPostedJobs)



export default router