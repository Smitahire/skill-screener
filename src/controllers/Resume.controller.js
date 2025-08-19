import fs from "fs";
import pdf from "pdf-parse";
import path from "path";

import prisma from "../database/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { GoogleGenAI } from "@google/genai";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


const uploadResume = asyncHandler(async (req, res) => {
    const resumePdfPath = req.file?.path;
    const userId = req.user.id;
    const role = req.user.role;

    if(role == "RECRUITER") throw new ApiError(400, "Only APPLICANT can upload resume!");

    if (!resumePdfPath) {
        throw new ApiError(400, "PDF path not found!");
    }

    // Parse PDF into string

    const pdfBuffer = fs.readFileSync(resumePdfPath);
    const pdfData = await pdf(pdfBuffer);
    const parsedText = pdfData.text.trim();

    // Upload to Cloudinary
    const fileUrl = await uploadOnCloudinary(resumePdfPath);
    if (!fileUrl) {
        throw new ApiError(400, "Resume file not uploaded!");
    }

    // Prepare AI prompt with strict JSON instruction
    const analysisPrompt = `
    You are a JSON-only generator. Your output must be valid JSON that can be parsed by JSON.parse() with no extra text or formatting.
    Do not include explanations, markdown, or any text outside the JSON.
    If a value is missing in the resume, return it as an empty string or empty array.

    Extract the following from the resume text:
    {
      "name": "",
      "email": "",
      "phone": "",
      "skills": [],
      "education": [{"degree": "", "institution": "", "year": ""}],
      "experience": [{"role": "", "company": "", "duration": "", "description": ""}]
    }

    Resume Text:
    ${parsedText}
    `;

    // Call Gemini API
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: analysisPrompt,
    });
    console.log(response.text);

    // Parse JSON safely
    let analysisJson;
    try {
        let rawText = response.text;
        analysisJson = JSON.parse(rawText);
    } catch (err) {
        console.error("AI raw response:", response.text());
        throw new ApiError(500, "AI response was not valid JSON");
    }

    // Check if resume exists
    const existingResume = await prisma.resume.findUnique({
        where: { userId },
    });

    let resume;
    if (existingResume) {
        // Update existing resume
        resume = await prisma.resume.update({
            where: { userId },
            data: {
                fileUrl,
                parsedText,
                analysis: analysisJson,
            },
        });
    } else {
        // Create new resume
        resume = await prisma.resume.create({
            data: {
                userId,
                fileUrl,
                parsedText,
                analysis: analysisJson,
            },
        });
    }

    res.status(201).json(
        new ApiResponse(
            201,
            resume,
            existingResume
                ? "Resume updated & analyzed successfully"
                : "Resume uploaded & analyzed successfully"
        )
    );
});

export {
    uploadResume,
}


