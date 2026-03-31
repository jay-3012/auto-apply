import { llmClient } from '../llm-client.js';

export interface FitScoreResult {
  score: number;
  reasoning: string;
}

const FIT_SCORE_SYSTEM_PROMPT = `
You are an expert technical recruiter. Your task is to evaluate the "Role Fit" between a job description (JD) and a candidate's resume.
The Role Fit score should represent how well the candidate's experience, senioritiy, and core skills align with the requirements of the JD.

Scoring Rubric (0-100):
- 90-100: Perfect match. Candidate has all required skills and the correct seniority level.
- 75-89: Strong match. Candidate has most core skills and relevant experience.
- 60-74: Potential match. Candidate has some core skills but might be missing specific niche requirements or has slightly different seniority.
- 40-59: Weak match. Significant skill gaps or seniority mismatch.
- 0-39: No match.

You MUST return the result in the following JSON format:
{
  "score": <number>,
  "reasoning": "<one paragraph explaining strictly why this score was given, focusing on overlap and gaps>"
}
`;

export const calculateFitScore = async (jd: string, resume: string): Promise<FitScoreResult> => {
  const userPrompt = `
Job Description:
"""
${jd}
"""

Candidate Resume:
"""
${resume}
"""

Evaluate the Role Fit. Return ONLY the JSON object.
`;

  const response = await llmClient.complete({
    messages: [
      { role: 'system', content: FIT_SCORE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0, // Deterministic for scoring
  });

  try {
    const cleanedJson = response.content.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedJson) as FitScoreResult;
  } catch (error) {
    console.error('[fit-score] Failed to parse AI response:', response.content);
    return {
      score: 50, // Default to neutral if AI fails
      reasoning: 'Error parsing AI evaluation. Default score applied.'
    };
  }
};
