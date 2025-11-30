import requests
import os

OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

class OpenAIService:
    def __init__(self, api_key):
        self.api_key = api_key
    
    def generate_response(self, messages, options=None):
        if options is None:
            options = {}
        
        temperature = options.get('temperature', 0.7)
        max_tokens = options.get('maxTokens', 1000)
        model = options.get('model', 'gpt-3.5-turbo')
        
        if not self.api_key:
            raise ValueError('OpenAI API key is not configured')
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        }
        
        payload = {
            'model': model,
            'messages': messages,
            'temperature': temperature,
            'max_tokens': max_tokens
        }
        
        try:
            response = requests.post(OPENAI_API_URL, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                'content': data['choices'][0]['message']['content'],
                'model': data['model'],
                'usage': data.get('usage', {})
            }
        except requests.exceptions.HTTPError as e:
            error_msg = 'Unknown error'
            try:
                error_data = e.response.json()
                error_msg = error_data.get('error', {}).get('message', str(e))
            except:
                error_msg = str(e)
            raise Exception(f'OpenAI API error: {error_msg}')
        except requests.exceptions.RequestException as e:
            raise Exception(f'OpenAI API request failed: {str(e)}')

