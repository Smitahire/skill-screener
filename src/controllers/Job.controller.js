import prisma from "../database/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createJob = asyncHandler(async (req, res) => {

    const { id: userId, role } = req.user || {};

    if (!userId) {
        throw new ApiError(401, "Unauthorized: Please log in.");
    }

    if (role !== "RECRUITER") {
        throw new ApiError(403, "Only recruiters can create jobs.");
    }

    const { title, description, questionConfig } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required.");
    }

    const job = await prisma.job.create({
        data: {
            title,
            description,
            recruiterId: userId,
            questionConfig: questionConfig || null
        }
    });

    return res
    .status(201)
    .json(new ApiResponse(201, job, "Job created successfully."));
});

// for recruiter dashbord
const getMyPostedJobs = asyncHandler(async (req, res) => {
    if (req.user.role !== "RECRUITER") {
        throw new ApiError(403, "Only recruiters can view posted jobs");
    }

    const jobs = await prisma.job.findMany({
        where: { recruiterId: req.user.id },
        include: { interviews: true }
    });

    res.status(200).json(new ApiResponse(200, jobs));
});

//public endpoint 
const getJobs = asyncHandler(async (req, res) => {
    const jobs = await prisma.job.findMany({
        select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
            recruiter: {
                select: { userName: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });
    res.status(200).json(new ApiResponse(200, jobs));
});

// delete job

export { 
    createJob, 
    getMyPostedJobs, 
    getJobs, 
};
