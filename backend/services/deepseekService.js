import axios from 'axios';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export class DeepSeekService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generateResponse(messages, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 1000,
      model = 'deepseek-chat'
    } = options;

    if (!this.apiKey) {
      throw new Error('DeepSeek API key is not configured');
    }

    try {
      const response = await axios.post(
        DEEPSEEK_API_URL,
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
          `DeepSeek API error: ${error.response.data?.error?.message || error.response.statusText}`
        );
      } else if (error.request) {
        throw new Error('DeepSeek API request failed: No response received');
      } else {
        throw new Error(`DeepSeek API error: ${error.message}`);
      }
    }
  }
}

