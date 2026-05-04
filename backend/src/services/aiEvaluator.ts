import fs from 'fs';
import pdfParse from 'pdf-parse';

function getApiKey(): string {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }
  return process.env.OPENROUTER_API_KEY;
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
  jobRequirements: string,
  storedCvText?: string | null
): Promise<EvaluationResult> {
  let cvText = '';

  if (storedCvText && storedCvText.length >= 50) {
    console.log(`[AI] Using stored CV text (${storedCvText.length} chars)`);
    cvText = storedCvText;
  } else {
    cvText = await extractTextFromPdf(cvPath);
  }

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

  const models = [
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-chat-v3-0324:free',
  ];

  let content = '';
  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      console.log(`[AI] Trying ${model} (attempt ${attempt})...`);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        }),
      });

      if (response.status === 429) {
        console.log(`[AI] Rate limited on ${model}, waiting 15s...`);
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }

      if (!response.ok) {
        const err = await response.text();
        console.log(`[AI] Error on ${model}: ${err}`);
        break; // try next model
      }

      const data: any = await response.json();
      content = data.choices?.[0]?.message?.content || '';
      if (content) break;
    }
    if (content) break;
  }

  if (!content) {
    const err = new Error('RATE_LIMITED: All models busy, will retry');
    (err as any).rateLimited = true;
    throw err;
  }

  // Extract JSON from possibly wrapped response (e.g. ```json ... ```)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : content;
  const result = JSON.parse(jsonStr) as EvaluationResult;

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
