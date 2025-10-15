import type { Request, Response } from "express";
import ScreeningSchema from "../models/screening.model.ts";
import axios from "axios";
import { PDFParse }  from "pdf-parse";
import mammoth from "mammoth";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Load the prompt template from a file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const promptTemplatePath = path.join(__dirname, '../config/prompt.txt');
const promptTemplate = fs.readFileSync(promptTemplatePath, 'utf-8');

// NOTE: This controller contains the complex logic for file processing and LLM calls.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;

interface UploadedFiles {
    resume?: Express.Multer.File[];
    jobDescription?: Express.Multer.File[];
}

interface MatchResult {
    match_score_percent: number;
    fit_summary: string;
    critical_missing_skills: string[];
    extracted_data: {
        name: string;
        email: string;
        total_years_experience: number;
    };
    skill_breakdown: {
        technical_match_count: number;
        soft_skill_match_count: number;
    };
}

const convertFileToText = async (file: Express.Multer.File): Promise<string> => {
    const mimeType = file.mimetype;
    const buffer = file.buffer;

    try {
        if (mimeType === 'application/pdf') {
            // Use pdf-parse for PDF buffers
            const parser = new PDFParse({data: buffer});
            const data = await parser.getText();
            return data.text.trim();
        } 
        
        else if (mimeType.includes('wordprocessingml.document')) {
            // Use mammoth for DOCX buffers
            const result = await mammoth.extractRawText({ buffer: buffer });
            return result.value.trim();
        } 
        
        else if (mimeType === 'text/plain') {
            // Handle plain text files easily
            return buffer.toString('utf-8').trim();
        }
        
        // Throw an error for any other file type
        throw new Error(`Unsupported file format: ${mimeType}`);

    } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        throw new Error(`Failed to extract text from document.`);
    }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const MAX_RETRIES = 5;

// Mock function to simulate the LLM API call (Gemini/GPT)
const callLLMScreening = async (resumeText: string, jobDescriptionText: string) => {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable not set.");
    }
    
    const prompt = `${promptTemplate}
    JOB DESCRIPTION: 
    ---
    ${jobDescriptionText}
    ---

    RESUME TEXT: 
    ---
    ${resumeText}
    ---`;

    console.log('[LLM] Calling Gemini API using Axios...');
    // console.log(prompt);

    const requestBody = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            // Correct mimeType property name for the direct API call
            responseMimeType: "application/json", 
            responseSchema: ScreeningSchema as any,
            temperature: 0.1,
        },
        // Specify the model directly in the request body for the API endpoint
        model: "gemini-2.5-pro", 
    };

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await axios.post(
                `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
                requestBody,
                { headers: { 'Content-Type': 'application/json' } }
            );

            // --- SUCCESS PATH ---
            const responseData = response.data;
            if (responseData.candidates && responseData.candidates[0]) {
                const jsonText = responseData.candidates[0].content.parts[0].text.trim();
                const result = JSON.parse(jsonText); 
                return result as MatchResult; // Success: return result
            }
            throw new Error("LLM response format was unexpected.");

        } catch (e: any) {
            const status = e.response?.status;
            
            // 1. Check for 503 UNAVAILABLE Status (and if not the last attempt)
            if (status === 503 && attempt < MAX_RETRIES - 1) {
                // Calculate backoff time: 2^attempt * 1000ms
                const backoffTime = Math.pow(2, attempt) * 1000;
                console.log(`[LLM Retry] Attempt ${attempt + 1}/${MAX_RETRIES} failed with 503 UNAVAILABLE. Retrying in ${backoffTime / 1000}s...`);
                await delay(backoffTime);
                continue; // Go to the next iteration (retry)
            } 
            
            // 2. Handle final failure (after retries or a non-503 error)
            const errorDetail = e.response?.data?.error?.message || e.message;
            console.error('Axios LLM API Failed:', errorDetail);
            
            // Re-throw the error to be caught by the main screeningController's catch block
            throw new Error(`LLM API failed after ${attempt + 1} attempts: ${errorDetail}`);
        }
    }
    // Safety net: Should be unreachable if the loop logic is correct
    throw new Error('Maximum retry attempts reached.');
};

const screeningController = {
    screenCandidate: async (req: Request, res: Response) => {
        // Placeholder logic for screening
        const { body, files } = req;
        // console.log(req);
        const uploadedFiles = files as UploadedFiles;
    
        // The frontend sends files OR text, but never both for a single input type.
        const resumeFile = uploadedFiles.resume?.[0] || null;
        const jdFile = uploadedFiles.jobDescription?.[0] || null;

        // console.log(resumeFile);
        // console.log(jdFile);
        
        let resumeText = body.resumeText || null;
        let jobDescriptionText = body.jobDescriptionText || null;
        
        try {
            // 1. Get Resume Text
            const resumeTask = (resumeFile && !resumeText) 
                ? convertFileToText(resumeFile) 
                : Promise.resolve(resumeText); // Resolve immediately if text is already present

            const jdTask = (jdFile && !jobDescriptionText) 
                ? convertFileToText(jdFile) 
                : Promise.resolve(jobDescriptionText);

            // 2. Wait for BOTH tasks to complete simultaneously
            const [parsedResumeText, parsedJdText] = await Promise.all([
                resumeTask,
                jdTask
            ]);

            resumeText = parsedResumeText;
            jobDescriptionText = parsedJdText;

            if (!resumeText) {
                return res.status(400).json({ message: 'Missing resume input (file or text).' });
            }
            if (!jobDescriptionText) {
                return res.status(400).json({ message: 'Missing job description input (file or text).' });
            }

            // 3. Call the LLM Orchestration Layer
            const screeningResult = await callLLMScreening(resumeText, jobDescriptionText);

            // 4. Send the structured result back to the React frontend
            res.status(200).json(screeningResult);

        }
        catch (error) {
            console.error('Screening API Error:', error);
            res.status(500).json({ message: 'Internal server error during screening process.' });
        }
    }
};

export default screeningController;