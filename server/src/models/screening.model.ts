import { Type } from "@google/genai";

const ScreeningSchema = {
    type: Type.OBJECT,
    properties: {
        match_score_percent: {
            type: Type.NUMBER, 
            description: "A score from 0 to 100 indicating the percentage fit of the resume to the job description."
        },
        fit_summary: {
            type: Type.STRING,
            // UPDATED: Changed description to reflect the desired length
            description: "A five to six-sentence summary of the candidate's core strengths and weaknesses relative to the job."
        },
        critical_missing_skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of all MUST-HAVE skills or certifications from the JD that are not present on the resume."
        },
        
        // --- NEW FIELDS ADDED ---
        technical_skills_matched: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of all specific technical skills (e.g., Python, AWS, React) successfully found and matched on the resume."
        },
        soft_skills_matched: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of all specific soft skills (e.g., leadership, communication, problem-solving) successfully found and matched on the resume."
        },
        // --- END NEW FIELDS ---

        extracted_data: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                total_years_experience: {
                    type: Type.NUMBER,
                    description: "Total relevant years of experience extracted from the resume."
                },
            },
            required: ["name", "email", "total_years_experience"],
        },
        skill_breakdown: {
            type: Type.OBJECT,
            properties: {
                // These counts should match the length of the new matched arrays
                technical_match_count: { type: Type.NUMBER }, 
                soft_skill_match_count: { type: Type.NUMBER },
            },
            required: ["technical_match_count", "soft_skill_match_count"],
        },
    },
    // UPDATED: Add the new fields to the required list
    required: [
        "match_score_percent", 
        "fit_summary", 
        "critical_missing_skills", 
        "technical_skills_matched", // NEW
        "soft_skills_matched",      // NEW
        "extracted_data", 
        "skill_breakdown"
    ],
};

export default ScreeningSchema;