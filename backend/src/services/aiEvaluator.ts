import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import pdfParse from 'pdf-parse';

function getGenAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export interface EvaluationResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  summary: string;
}

async function extractTextFromPdf(filePath: string): Promise<string> {
  console.log(`[AI] Reading PDF from: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF file not found at path: ${filePath}`);
  }
  const buffer = fs.readFileSync(filePath);
  console.log(`[AI] PDF buffer size: ${buffer.length} bytes`);
  const data = await pdfParse(buffer);
  console.log(`[AI] Extracted text length: ${data.text.trim().length} chars`);
  return data.text.trim();
}

export async function evaluateResume(
  cvPath: string,
  jobTitle: string,
  jobDescription: string,
  jobRequirements: string
): Promise<EvaluationResult> {
  const cvText = await extractTextFromPdf(cvPath);

  if (!cvText || cvText.length < 50) {
    throw new Error('Could not extract readable text from the PDF');
  }

  const prompt = `You are an expert HR recruiter. Evaluate the following resume against the job position below.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}

JOB REQUIREMENTS:
${jobRequirements}

RESUME CONTENT:
${cvText.slice(0, 6000)}

Respond ONLY with a valid JSON object in this exact format:
{
  "score": <integer 0-100>,
  "strengths": [<3-5 specific strengths relevant to this job>],
  "weaknesses": [<2-4 gaps or missing qualifications>],
  "recommendation": "<one of: Highly Recommended | Recommended | Consider | Not Recommended>",
  "summary": "<2-3 sentence overall honest assessment>"
}`;

  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
  });

  const response = await model.generateContent(prompt);
  const content = response.response.text();
  if (!content) throw new Error('Empty response from AI');

  const result = JSON.parse(content) as EvaluationResult;

  if (
    typeof result.score !== 'number' ||
    !Array.isArray(result.strengths) ||
    !Array.isArray(result.weaknesses) ||
    typeof result.recommendation !== 'string' ||
    typeof result.summary !== 'string'
  ) {
    throw new Error('Invalid AI response format');
  }

  result.score = Math.max(0, Math.min(100, Math.round(result.score)));
  return result;
}
