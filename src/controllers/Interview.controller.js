import { asyncHandler } from "../utils/asyncHandler.js";
import prisma from "../database/prisma.js";


const generateInterview = asyncHandler( async ( req, res) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { jobId } = req.body;

    if (!userId || !jobId) {
        throw new ApiError(400, "Missing userId or jobId");
    }

    if (role !== "APPLICANT") {
        throw new ApiError(403, "Only applicants can generate interviews");
    }

    // Find resume (unique for each user)
    const resume = await prisma.resume.findUnique({
        where: { userId },
    });

    if (!resume) {
        throw new ApiError(404, "Resume not found for this user");
    }

    // Create interview
    const interview = await prisma.interview.create({
        data: {
            userId,
            jobId,
            resumeId: resume.id,
            status: "PENDING",
        },
    });

    return res
    .status(201)
    .json(new ApiResponse(201, interview, "Interview generated successfully"));
})
