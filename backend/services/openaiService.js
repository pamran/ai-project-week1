import axios from 'axios';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export class OpenAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generateResponse(messages, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 1000,
      model = 'gpt-3.5-turbo'
    } = options;

    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model,
          messages,
          temperature,
          max_tokens: maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        content: response.data.choices[0].message.content,
        model: response.data.model,
        usage: response.data.usage
      };
    } catch (error) {
      if (error.response) {
        throw new Error(
          `OpenAI API error: ${error.response.data?.error?.message || error.response.statusText}`
        );
      } else if (error.request) {
        throw new Error('OpenAI API request failed: No response received');
      } else {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
    }
  }
}

