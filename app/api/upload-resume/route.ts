export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse-fixed";
import * as mammoth from "mammoth";

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();

    let text = "";

    if (fileName.endsWith(".pdf")) {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (fileName.endsWith(".docx")) {
      text = await extractTextFromDocx(buffer);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload PDF or DOCX." },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from this file." },
        { status: 400 }
      );
    }

    return NextResponse.json({ resumeText: text });
  } catch (error) {
    console.error("Error in /api/upload-resume:", error);
    return NextResponse.json(
      { error: "Failed to process resume." },
      { status: 500 }
    );
  }
}