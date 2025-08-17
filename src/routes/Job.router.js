import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewear.js";
import { createJob, getJobs, getMyPostedJobs } from "src/controllers/Job.controller.js";



const router = Router();

router.route('/create-job').post(createJob)
router.route('/get-jobs').get(getJobs)

//recruiter dashbord
router.route('/get-my-posted-job').get(getMyPostedJobs)



export default router