import { asyncHandler } from "../utils/asyncHandler.js";
import prisma from "../database/prisma.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

const generateQuestions = async ( resumeID, jobID) => {
    // fetch resume analysis + job details
    const resume = await prisma.resume.findUnique({
        where: { id: resumeID },
        select: { analysis: true },
    });

    const job = await prisma.job.findUnique({
        where: { id: jobID },
        select: { description: true, questionConfig: true },
    });

    if (!resume || !job) throw new Error("Invalid resumeId or jobId");

    const { analysis } = resume;
    const { description, questionConfig } = job;

    const prompt = `
        You are an interview question generator.
        Use the job description and the candidate's resume analysis to generate interview questions. 
        Follow this config exactly: ${JSON.stringify(questionConfig)}.
        Each question must include: text, type (TEXT, CODING, MULTIPLE_CHOICE), expectedAnswer.

        Job Description: ${description}
        Resume Analysis: ${JSON.stringify(analysis)}

        Return ONLY valid JSON in this format:
        {
            "questions": [
            { "text": "...", "type": "TEXT", "expectedAnswer": "..." }
            ]
        }
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });


    // Parse JSON
    let questionsJson;
    try {
        let rawText = response.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/(^```(json)?\s*|\s*```$)/g, '').trim();
        questionsJson = JSON.parse(rawText);
    } catch (err) {
        console.error("AI raw response:", response.candidates[0].content.parts[0].text);
        throw new ApiError(500, "AI response was not valid JSON");
    }


    // validate
    const questions = questionsJson.questions?.filter(
        q => q.text && q.type && q.expectedAnswer
    ) || [];

    if (questions.length === 0) {
        throw new Error("Gemini returned no valid questions");
    }

    return questions;
}

const generateQuestionsForAnswer = asyncHandler( async ( req, res )=> {
    const interviewID = req.body.interviewID

    if(!interviewID) throw new ApiError(404, "Interview is Not Generated!");

    const interview = await prisma.interview.findUnique({
        where: {id : interviewID},
        select: {
            resumeId,
            jobId,
        }
    })
    if(!interview) throw new ApiError(404, "wrong Interview ID or interview Not genrated!");

    // prevent duplicate generation
    if (interview.answers.length > 0) {
        throw new ApiError(400, "Questions already generated for this interview")
    }

    const rawQuestions = await generateQuestions(interview.resumeId, interview.jobId);

    // persist in Answer table
    await prisma.answer.createMany({
        data: rawQuestions.map((q) => ({
            interviewId: interview.id,
            text: q.text,
            type: q.type,
            expectedAnswer: q.expectedAnswer,
        })),
    });

    const updatedInterview = await prisma.interview.findUnique({
        where: { id: interviewID },
        include: { answers: true },
    });

     return res
    .status(200)
    .json(new ApiResponse(200, updatedInterview, "Questions generated successfully"));

})