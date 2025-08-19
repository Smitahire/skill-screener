import fs from "fs";
import pdf from "pdf-parse";
import path from "path";

import prisma from "../database/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { GoogleGenAI } from "@google/genai";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { log } from "console";

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


    const fileUrl = await uploadOnCloudinary(resumePdfPath);
    if (!fileUrl) {
        throw new ApiError(400, "Resume file not uploaded!");
    }
    console.log("file url:" , fileUrl);
    

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

    // Gemini API
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: analysisPrompt,
    });
    
    
    // Parse JSON
    let analysisJson;
    try {
        let rawText = response.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/(^```(json)?\s*|\s*```$)/g, '').trim();
        analysisJson = JSON.parse(rawText);
    } catch (err) {
        console.error("AI raw response:", response.candidates[0].content.parts[0].text);
        throw new ApiError(500, "AI response was not valid JSON");
    }

    const existingResume = await prisma.resume.findUnique({
        where: { userId },
    });

    let resume;
    if (existingResume) {
        // Update resume if resume alredy exist
        resume = await prisma.resume.update({
            where: { userId },
            data: {
                fileUrl: fileUrl.url,
                parsedText,
                analysis: analysisJson,
            },
        });
    } else {
        // Create new resume
        resume = await prisma.resume.create({
            data: {
                userId,
                fileUrl: fileUrl.url,
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


