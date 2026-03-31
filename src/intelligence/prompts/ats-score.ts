import { llmClient } from '../llm-client.js';

export interface AtsScoreResult {
  score: number;
  gapAnalysis: string[];
}

const ATS_SCORE_SYSTEM_PROMPT = `
You are an expert ATS (Applicant Tracking System) optimizer. Your task is to analyze how well a candidate's resume keywords align with the requirements of a specific job description.

The ATS compatibility score should focus on keyword match density and core skill presence.
The Gap Analysis MUST be a list of 3-7 specific missing or underrepresented skills, technologies, or qualifications that are sought in the JD.

You MUST return the result in the following JSON format:
{
  "score": <number 0-100>,
  "gapAnalysis": ["<missing skill 1>", "<missing skill 2>", ...]
}
`;

export const calculateAtsScore = async (jd: string, resume: string): Promise<AtsScoreResult> => {
  const userPrompt = `
Job Description:
"""
${jd}
"""

Candidate Resume:
"""
${resume}
"""

Evaluate the ATS compatibility and return the Gap Analysis list. Return ONLY the JSON object.
`;

  const response = await llmClient.complete({
    messages: [
      { role: 'system', content: ATS_SCORE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1, // Slight variability allowed for nuance
  });

  try {
    const cleanedJson = response.content.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedJson) as AtsScoreResult;
  } catch (error) {
    console.error('[ats-score] Failed to parse AI response:', response.content);
    return {
      score: 50,
      gapAnalysis: ['Unable to perform gap analysis.']
    };
  }
};
