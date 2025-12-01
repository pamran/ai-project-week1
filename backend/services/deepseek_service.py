import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from utils.logger import get_logger

class DeepSeekService:
    def __init__(self, api_key):
        self.logger = get_logger(__name__)
        self.api_key = api_key
        if not self.api_key:
            self.logger.error("DeepSeekService initialization failed: API key not provided")
            raise ValueError('OpenRouter API key is not configured')
        
        # Mask API key for logging (show only last 4 chars)
        masked_key = f"{'*' * (len(self.api_key) - 4)}{self.api_key[-4:]}" if len(self.api_key) > 4 else "****"
        self.logger.info(f"🔑 DeepSeek Service initialized")
        self.logger.info(f"   API Key: {masked_key} (length: {len(self.api_key)})")
    
    def generate_response(self, messages, options=None):
        if options is None:
            options = {}
        
        temperature = options.get('temperature', 0.7)
        max_tokens = options.get('maxTokens', 1000)
        # OpenRouter model format: deepseek/deepseek-chat
        model = options.get('model', 'deepseek/deepseek-chat')
        
        # Auto-fix model name if user entered old format
        original_model = model
        if model and '/' not in model:
            # If model doesn't have provider prefix, add it
            if model.startswith('deepseek-'):
                model = f"deepseek/{model}"
            elif model == 'deepseek-chat' or model == 'chat':
                model = 'deepseek/deepseek-chat'
            else:
                # Default to deepseek/deepseek-chat if unclear
                model = 'deepseek/deepseek-chat'
            
            if original_model != model:
                self.logger.info(f"🔧 Model name auto-corrected: '{original_model}' → '{model}'")
        
        self.logger.info(f"⚙️  Request Parameters:")
        self.logger.info(f"   Model: {model}")
        self.logger.info(f"   Temperature: {temperature}")
        self.logger.info(f"   Max Tokens: {max_tokens}")
        
        try:
            # Verify API key is set and valid before making the call
            api_key_clean = self.api_key.strip() if self.api_key else ""
            if not api_key_clean or len(api_key_clean) < 10:
                self.logger.error(f"API key appears to be invalid - Length: {len(api_key_clean) if api_key_clean else 0}")
                raise ValueError("Invalid OpenRouter API key - key is missing or too short")
            
            # Log API key info (masked for security)
            masked_key = f"{'*' * (len(api_key_clean) - 4)}{api_key_clean[-4:]}" if len(api_key_clean) > 4 else "****"
            self.logger.info(f"Using OpenRouter API key: {masked_key} (length: {len(api_key_clean)})")
            
            # Check if key starts with expected prefix
            if not api_key_clean.startswith('sk-or-v1-') and not api_key_clean.startswith('sk-'):
                self.logger.warning(f"API key doesn't start with expected prefix (sk-or-v1- or sk-)")
                self.logger.warning(f"Key starts with: {api_key_clean[:10]}...")
            
            # Use OpenRouter API endpoint
            # OpenRouter uses OpenAI-compatible API
            self.logger.debug(f"Initializing ChatOpenAI with OpenRouter endpoint: https://openrouter.ai/api/v1")
            
            # OpenRouter requires Authorization header with Bearer token
            # The openai_api_key parameter should automatically set this
            llm = ChatOpenAI(
                model=model,  # Format: deepseek/deepseek-chat
                temperature=temperature,
                max_tokens=max_tokens,
                openai_api_key=api_key_clean,  # Clean API key without whitespace
                openai_api_base='https://openrouter.ai/api/v1',  # OpenRouter endpoint
                timeout=30,
                default_headers={
                    "HTTP-Referer": "https://github.com/dual-llm-conversation",
                    "X-Title": "Dual LLM Conversation System"
                }
            )
            self.logger.debug(f"ChatOpenAI initialized successfully with model: {model}")
            self.logger.debug(f"ChatOpenAI initialized successfully")
            
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
            self.logger.info(f"📡 Calling DeepSeek API via OpenRouter...")
            self.logger.info(f"   Sending {len(langchain_messages)} messages")
            import time
            start_time = time.time()
            response = llm.invoke(langchain_messages)
            elapsed_time = time.time() - start_time
            self.logger.info(f"✅ API call completed in {elapsed_time:.2f} seconds")
            
            # Extract response content
            response_content = response.content if hasattr(response, 'content') else str(response)
            
            # Get usage information if available
            usage = {}
            if hasattr(response, 'response_metadata'):
                usage = response.response_metadata.get('token_usage', {})
                if usage:
                    self.logger.debug(f"Token usage: {usage}")
            
            self.logger.info(f"📝 Response generated: {len(response_content)} characters")
            
            return {
                'content': response_content,
                'model': model,
                'usage': usage
            }
        except Exception as e:
            error_msg = str(e)
            self.logger.error("")
            self.logger.error("=" * 70)
            self.logger.error(f"❌ DEEPSEEK API ERROR")
            self.logger.error(f"   Error: {error_msg}")
            self.logger.error("=" * 70)
            self.logger.error("", exc_info=True)
            
            # Handle specific LangChain/API errors
            if 'api_key' in error_msg.lower() or 'authentication' in error_msg.lower() or '401' in error_msg or 'cookie' in error_msg.lower():
                self.logger.error("🔑 AUTHENTICATION ERROR")
                self.logger.error("   → Check your OpenRouter API key")
                self.logger.error("   → Make sure key starts with 'sk-or-v1-'")
                self.logger.error("   → Verify key is complete (30+ characters)")
                raise Exception(f'OpenRouter API authentication error: {error_msg}')
            elif 'rate limit' in error_msg.lower() or 'quota' in error_msg.lower():
                self.logger.error("⏱️  RATE LIMIT / QUOTA ERROR")
                self.logger.error("   → Check your OpenRouter account credits")
                self.logger.error("   → Visit: https://openrouter.ai/activity")
                raise Exception(f'OpenRouter API rate limit/quota exceeded: {error_msg}')
            elif 'billing' in error_msg.lower() or 'payment' in error_msg.lower():
                self.logger.error("💳 BILLING ERROR")
                self.logger.error("   → Add credits to your OpenRouter account")
                self.logger.error("   → Visit: https://openrouter.ai/activity")
                raise Exception(f'OpenRouter billing error: {error_msg}')
            else:
                raise Exception(f'OpenRouter API error: {error_msg}')

