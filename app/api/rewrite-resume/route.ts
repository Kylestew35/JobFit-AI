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
You are an expert resume writer.

Rewrite the resume to better match the job description.

Rules:
- Do NOT lie.
- Do NOT invent experience, companies, or titles.
- Do NOT change job titles.
- You may rephrase bullets to highlight relevant skills.
- Keep it ATS-friendly, clean, and professional.
- Keep roughly the same length, unless trimming irrelevant content.

Return ONLY the rewritten resume in plain text, ready to copy and paste.

Original Resume:
"""
${resumeText}
"""

Job Description:
"""
${jobDescription}
"""
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer. Always follow the rules and never fabricate experience.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    });

    const rewrittenResume = completion.choices[0]?.message?.content ?? "";

    return NextResponse.json({ rewrittenResume });
  } catch (error) {
    console.error("Error in /api/rewrite-resume:", error);
    return NextResponse.json(
      { error: "Failed to rewrite resume." },
      { status: 500 }
    );
  }
}