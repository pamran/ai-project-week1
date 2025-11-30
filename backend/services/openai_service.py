import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

class OpenAIService:
    def __init__(self, api_key):
        self.api_key = api_key
        if not self.api_key:
            raise ValueError('OpenAI API key is not configured')
    
    def generate_response(self, messages, options=None):
        if options is None:
            options = {}
        
        temperature = options.get('temperature', 0.7)
        max_tokens = options.get('maxTokens', 1000)
        model = options.get('model', 'gpt-3.5-turbo')
        
        try:
            # Initialize LangChain ChatOpenAI
            llm = ChatOpenAI(
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                openai_api_key=self.api_key,
                timeout=30
            )
            
            # Convert messages to LangChain format
            langchain_messages = []
            for msg in messages:
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                
                if role == 'system':
                    langchain_messages.append(SystemMessage(content=content))
                elif role == 'user':
                    langchain_messages.append(HumanMessage(content=content))
                elif role == 'assistant':
                    langchain_messages.append(AIMessage(content=content))
            
            # Generate response
            response = llm.invoke(langchain_messages)
            
            # Extract response content
            response_content = response.content if hasattr(response, 'content') else str(response)
            
            # Get usage information if available
            usage = {}
            if hasattr(response, 'response_metadata'):
                usage = response.response_metadata.get('token_usage', {})
            
            return {
                'content': response_content,
                'model': model,
                'usage': usage
            }
        except Exception as e:
            error_msg = str(e)
            # Handle specific LangChain/API errors
            if 'api_key' in error_msg.lower() or 'authentication' in error_msg.lower():
                raise Exception(f'OpenAI API authentication error: {error_msg}')
            elif 'rate limit' in error_msg.lower() or 'quota' in error_msg.lower():
                raise Exception(f'OpenAI API rate limit/quota exceeded: {error_msg}')
            else:
                raise Exception(f'OpenAI API error: {error_msg}')

