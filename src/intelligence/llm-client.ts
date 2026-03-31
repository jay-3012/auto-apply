import { env } from '../config/env.js';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequestOptions {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class LLMClient {
  private readonly groqApiKey: string;
  private readonly geminiApiKey: string;

  constructor() {
    this.groqApiKey = env.GROQ_API_KEY || '';
    this.geminiApiKey = env.GEMINI_API_KEY || '';
  }

  /**
   * Completes a prompt using the primary model (Groq/Llama 3.3)
   * falls back to secondary model (Gemini 2.0 Flash) on failure.
   */
  async complete(options: LLMRequestOptions): Promise<LLMResponse> {
    try {
      console.log(`[llm-client] Attempting completion with Groq (Llama 3.3)...`);
      return await this.completeWithGroq(options);
    } catch (error) {
      console.error(`[llm-client] Groq failed, falling back to Gemini...`, error);
      try {
        return await this.completeWithGemini(options);
      } catch (geminiError) {
        console.error(`[llm-client] Gemini also failed.`, geminiError);
        throw new Error('All LLM providers failed.');
      }
    }
  }

  private async completeWithGroq(options: LLMRequestOptions): Promise<LLMResponse> {
    if (!this.groqApiKey) throw new Error('GROQ_API_KEY is missing');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'llama-3.3-70b-versatile',
        messages: options.messages,
        temperature: options.temperature ?? 0.1,
        max_tokens: options.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json() as any;
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }

  private async completeWithGemini(options: LLMRequestOptions): Promise<LLMResponse> {
    if (!this.geminiApiKey) throw new Error('GEMINI_API_KEY is missing');

    // Gemini API v1beta uses a different structure
    // Simplifying to the typical OpenAI-compatible endpoint if using Google's AI Studio with Gemini Pro
    // However, Google has its own format. I'll use the Gemini 1.5/2.0 format.
    
    const systemInstruction = options.messages.find(m => m.role === 'system')?.content;
    const contents = options.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.1,
          maxOutputTokens: options.maxTokens ?? 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json() as any;
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return {
      content,
      model: 'gemini-2.0-flash',
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
    };
  }
}

export const llmClient = new LLMClient();
