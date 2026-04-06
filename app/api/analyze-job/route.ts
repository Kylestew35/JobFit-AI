export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Missing resumeText or jobDescription." },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert hiring manager and career coach.

Return ONLY valid JSON with this exact structure:

{
  "matchPercentage": number,
  "missingSkills": string[],
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert hiring manager. You MUST return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    // ⭐ FIX: Safely read parsed OR content
    const msg = completion.choices[0].message;

    const parsed =
      msg.parsed ||
      (typeof msg.content === "string" ? JSON.parse(msg.content) : null);

    if (!parsed) {
      throw new Error("Could not parse JSON from model.");
    }

    return NextResponse.json({ analysis: parsed });
  } catch (error) {
    console.error("Error in /api/analyze-job:", error);
    return NextResponse.json(
      { error: "Failed to analyze job." },
      { status: 500 }
    );
  }
}
