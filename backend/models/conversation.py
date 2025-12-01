from datetime import datetime
from services.deepseek_service import DeepSeekService
from services.openai_service import OpenAIService

class ConversationManager:
    def __init__(self, socketio):
        self.socketio = socketio
        self.history = []
        self.topic = None
        self.starting_llm = None
        self.current_turn = None
        self.is_active = False
        self.is_paused = False
        self.llm1_config = None
        self.llm2_config = None
        self.llm1_service = None
        self.llm2_service = None
    
    def start_conversation(self, topic, starting_llm, llm1_config, llm2_config):
        # Validation
        if not topic or not topic.strip():
            raise ValueError('Topic is required')
        
        if starting_llm not in ['llm1', 'llm2']:
            raise ValueError('Starting LLM must be either "llm1" or "llm2"')
        
        if not llm1_config or not llm2_config:
            raise ValueError('Both LLM configurations are required')
        
        if not llm1_config.get('apiKey') or not llm1_config.get('apiKey').strip():
            raise ValueError('LLM1 API key is required')
        
        if not llm2_config.get('apiKey') or not llm2_config.get('apiKey').strip():
            raise ValueError('LLM2 API key is required')
        
        provider1 = llm1_config.get('provider')
        provider2 = llm2_config.get('provider')
        
        if provider1 not in ['deepseek', 'openai']:
            raise ValueError('LLM1 provider must be either "deepseek" or "openai"')
        
        if provider2 not in ['deepseek', 'openai']:
            raise ValueError('LLM2 provider must be either "deepseek" or "openai"')
        
        self.topic = topic.strip()
        self.starting_llm = starting_llm
        self.current_turn = starting_llm
        self.is_active = True
        self.is_paused = False
        self.history = []
        self.llm1_config = llm1_config
        self.llm2_config = llm2_config
        
        # Initialize LLM services
        try:
            self.llm1_service = self._create_service(
                provider1, llm1_config.get('apiKey')
            )
            self.llm2_service = self._create_service(
                provider2, llm2_config.get('apiKey')
            )
        except Exception as e:
            raise Exception(f'Failed to initialize LLM services: {str(e)}')
        
        # Add initial system message
        self.history.append({
            'llmId': 'system',
            'role': 'system',
            'content': f'Conversation started. Topic: {self.topic}. {starting_llm} will start.',
            'timestamp': datetime.now().isoformat()
        })
        
        # Emit conversation started event
        self.socketio.emit('conversation:started', {
            'topic': self.topic,
            'startingLLM': self.starting_llm,
            'history': self.history
        })
    
    def _create_service(self, provider, api_key):
        if provider == 'deepseek':
            return DeepSeekService(api_key)
        elif provider == 'openai':
            return OpenAIService(api_key)
        else:
            raise ValueError(f'Unknown provider: {provider}')
    
    def send_message(self, llm_id, message):
        if not self.is_active:
            raise ValueError('No active conversation. Please start a conversation first.')
        
        if self.is_paused:
            raise ValueError('Conversation is paused. Please resume first.')
        
        if llm_id not in ['llm1', 'llm2']:
            raise ValueError(f'Invalid LLM ID: {llm_id}')
        
        if not message or not message.strip():
            raise ValueError('Message cannot be empty')
        
        if llm_id != self.current_turn:
            raise ValueError(f"It's not {llm_id}'s turn. Current turn: {self.current_turn}")
        
        # Emit thinking state
        self.socketio.emit('message:thinking', {'llmId': llm_id})
        
        try:
            # Get the appropriate service and config
            service = self.llm1_service if llm_id == 'llm1' else self.llm2_service
            config = self.llm1_config if llm_id == 'llm1' else self.llm2_config
            
            # Build messages array for API
            api_messages = [
                {
                    'role': 'system',
                    'content': config.get('systemPrompt', 'You are a helpful AI assistant.')
                }
            ]
            
            # Add conversation history
            for msg in self.history:
                if msg.get('llmId') != 'system':
                    role = 'assistant' if msg.get('llmId') == llm_id else 'user'
                    api_messages.append({
                        'role': role,
                        'content': msg.get('content')
                    })
            
            # Add current message
            api_messages.append({
                'role': 'user',
                'content': message
            })
            
            # Generate response
            response = service.generate_response(api_messages, {
                'temperature': config.get('temperature', 0.7),
                'maxTokens': config.get('maxTokens', 1000),
                'model': config.get('model')
            })
            
            # Add message to history
            user_message = {
                'llmId': llm_id,
                'role': 'user',
                'content': message,
                'timestamp': datetime.now().isoformat()
            }
            
            assistant_message = {
                'llmId': llm_id,
                'role': 'assistant',
                'content': response['content'],
                'timestamp': datetime.now().isoformat(),
                'model': response['model'],
                'usage': response.get('usage', {})
            }
            
            self.history.append(user_message)
            self.history.append(assistant_message)
            
            # Switch turn
            self.current_turn = 'llm2' if llm_id == 'llm1' else 'llm1'
            
            # Emit message sent event
            self.socketio.emit('message:sent', {
                'userMessage': user_message,
                'assistantMessage': assistant_message,
                'currentTurn': self.current_turn,
                'history': self.history
            })
        except Exception as e:
            self.socketio.emit('error', {
                'llmId': llm_id,
                'message': str(e)
            })
            raise
    
    def reset(self):
        self.history = []
        self.topic = None
        self.starting_llm = None
        self.current_turn = None
        self.is_active = False
        self.is_paused = False
        self.llm1_config = None
        self.llm2_config = None
        self.llm1_service = None
        self.llm2_service = None
    
    def pause(self):
        self.is_paused = True
    
    def resume(self):
        self.is_paused = False
    
    def get_history(self):
        return self.history
    
    def get_current_turn(self):
        return self.current_turn
    
    def get_topic(self):
        return self.topic
    
    def get_is_active(self):
        return self.is_active
    
    def get_is_paused(self):
        return self.is_paused

