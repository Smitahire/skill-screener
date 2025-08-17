import { asyncHandler } from "../utils/asyncHandler.js";


const generateInterview = asyncHandler( async (req, res) => {
    const user = req.user; // applicant (from verifyJWT)
    if (!user || user.role !== "APPLICANT") {
      throw new ApiError(403, "Only applicants can generate an interview");
    }

    const { jobId } = req.body;

    if (!jobId) {
      throw new ApiError(400, "Job ID is required");
    }

    // Find resume by applicant (userId is unique in Resume)
    const resume = await prisma.resume.findUnique({
      where: { userId: user.id },
    });

    if (!resume) {
      throw new ApiError(404, "Please upload your resume before applying");
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        userId: user.id,
        jobId,
        resumeId: resume.id,
        status: "PENDING",
      },
      include: {
        job: true,
        resume: true,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, interview, "Interview generated successfully"));
})

export {generateInterview}