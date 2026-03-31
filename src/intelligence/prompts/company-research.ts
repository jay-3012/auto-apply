import { llmClient } from '../llm-client.js';

export interface CompanyResearchResult {
  summary: string;
}

const RESEARCH_SYSTEM_PROMPT = `
You are a career researcher. You have been given raw search results for a company.
Your task is to produce a structured brief for a job applicant.

The brief MUST cover:
1. Company Size & Stage (e.g. Seed, Series B, Public)
2. What they do (Product/Service focus)
3. Culture & Work Environment signals
4. Notable Red Flags (e.g. recent layoffs, lawsuits, bad reviews)
5. Overall Assessment

If the search results are empty or irrelevant, provide a general professional overview if the company is well-known, or state that limited information was found.

Format your output as a professional markdown brief.
`;

export const summarizeResearch = async (companyName: string, searchResults: string): Promise<string> => {
  const userPrompt = `
Company: ${companyName}

Search Results:
"""
${searchResults}
"""

Produce the brief.
`;

  const response = await llmClient.complete({
    messages: [
      { role: 'system', content: RESEARCH_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
  });

  return response.content;
};
