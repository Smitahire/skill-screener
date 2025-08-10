import fs from "fs";
import pdfParse from "pdf-parse";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { prisma } from "../prismaClient.js";
import { GoogleGenAI } from "@google/genai";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const uploadResume = asyncHandler(async (req, res) => {

    const resumePdfPath = req.files.resumePdf?.[0]?.path;
    const userId = req.user.id;


    if (!resumePdfPath) {
        throw new ApiError(400, "PDF path not found!");
    }

    // Check if resume already exists for this user
    const existingResume = await prisma.resume.findUnique({
        where: { userId },
    });


    // OPTION 1: Throw error if resume exists
    // if (existingResume) {
    //     throw new ApiError(400, "You have already uploaded a resume.");
    // }


    // OPTION 2: Delete old resume before adding a new one
    if (existingResume) {
        await prisma.resume.delete({ where: { userId } });
    }


    // Parse PDF into string
    const pdfBuffer = fs.readFileSync(resumePdfPath);
    const pdfData = await pdfParse(pdfBuffer);
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
    ${parsedText}`;


    // Call Gemini API
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: analysisPrompt,
    });


    // Parse JSON safely
    let analysisJson;
    try {
        const rawText = response.text().trim();
        analysisJson = JSON.parse(rawText);
    } catch (err) {
        throw new ApiError(500, "AI response was not valid JSON");
    }


    // Save in DB
    const resume = await prisma.resume.create({
        data: {
            userId,
            fileUrl,
            parsedText,
            analysis: analysisJson,
        },
    });


    res.status(201).json(
        new ApiResponse(
            201,
            resume,
            existingResume
                ? "Old resume replaced & analyzed successfully"
                : "Resume uploaded & analyzed successfully"
        )
    );
});

