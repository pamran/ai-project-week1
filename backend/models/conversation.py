from datetime import datetime
from services.deepseek_service import DeepSeekService
from services.openai_service import OpenAIService
from utils.logger import get_logger

class ConversationManager:
    def __init__(self, socketio, logger=None):
        self.socketio = socketio
        self.logger = logger or get_logger(__name__)
        self.history = []
        self.topic = None
        self.starting_llm = None
        self.current_turn = None
        self.is_active = False
        self.is_paused = False
        self.auto_continue = True  # Enable automatic conversation continuation
        self.llm1_config = None
        self.llm2_config = None
        self.llm1_service = None
        self.llm2_service = None
        self.logger.info("ConversationManager initialized")
    
    def start_conversation(self, topic, starting_llm, llm1_config, llm2_config):
        self.logger.info("=" * 70)
        self.logger.info(f"🚀 STARTING NEW CONVERSATION")
        self.logger.info(f"   Topic: '{topic}'")
        self.logger.info(f"   Starting LLM: {starting_llm.upper()}")
        self.logger.info("=" * 70)
        
        # Validation
        if not topic or not topic.strip():
            self.logger.error("Conversation start failed: Topic is required")
            raise ValueError('Topic is required')
        
        if starting_llm not in ['llm1', 'llm2']:
            self.logger.error(f"Conversation start failed: Invalid starting LLM '{starting_llm}'")
            raise ValueError('Starting LLM must be either "llm1" or "llm2"')
        
        if not llm1_config or not llm2_config:
            self.logger.error("Conversation start failed: Missing LLM configurations")
            raise ValueError('Both LLM configurations are required')
        
        if not llm1_config.get('apiKey') or not llm1_config.get('apiKey').strip():
            self.logger.error("Conversation start failed: LLM1 API key is missing")
            raise ValueError('LLM1 API key is required')
        
        if not llm2_config.get('apiKey') or not llm2_config.get('apiKey').strip():
            self.logger.error("Conversation start failed: LLM2 API key is missing")
            raise ValueError('LLM2 API key is required')
        
        provider1 = llm1_config.get('provider')
        provider2 = llm2_config.get('provider')
        
        self.logger.info(f"📋 LLM Configuration:")
        self.logger.info(f"   LLM1: Provider={provider1}, Model={llm1_config.get('model')}, Temp={llm1_config.get('temperature', 0.7)}")
        self.logger.info(f"   LLM2: Provider={provider2}, Model={llm2_config.get('model')}, Temp={llm2_config.get('temperature', 0.7)}")
        
        if provider1 not in ['deepseek', 'openai']:
            self.logger.error(f"Conversation start failed: Invalid LLM1 provider '{provider1}'")
            raise ValueError('LLM1 provider must be either "deepseek" or "openai"')
        
        if provider2 not in ['deepseek', 'openai']:
            self.logger.error(f"Conversation start failed: Invalid LLM2 provider '{provider2}'")
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
            self.logger.info("")
            self.logger.info(f"🔧 Initializing LLM Services...")
            self.logger.info(f"   → LLM1 ({provider1}): Connecting to API...")
            self.llm1_service = self._create_service(
                provider1, llm1_config.get('apiKey')
            )
            self.logger.info(f"   ✅ LLM1 service ready!")
            
            self.logger.info(f"   → LLM2 ({provider2}): Connecting to API...")
            self.llm2_service = self._create_service(
                provider2, llm2_config.get('apiKey')
            )
            self.logger.info(f"   ✅ LLM2 service ready!")
            self.logger.info("")
        except Exception as e:
            self.logger.error(f"Failed to initialize LLM services: {str(e)}", exc_info=True)
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
        
        # Automatically start the conversation with the starting LLM
        if self.auto_continue:
            self.logger.info(f"⚡ Auto-starting conversation...")
            self.logger.info(f"   → {self.starting_llm.upper()} will send the first message")
            # Use the topic as the initial message - send it from the starting LLM
            initial_message = f"Let's discuss: {self.topic}"
            # Small delay to ensure everything is initialized
            import threading
            threading.Timer(0.5, lambda: self.send_message(self.starting_llm, initial_message)).start()
    
    def _create_service(self, provider, api_key):
        if provider == 'deepseek':
            return DeepSeekService(api_key)
        elif provider == 'openai':
            return OpenAIService(api_key)
        else:
            raise ValueError(f'Unknown provider: {provider}')
    
    def send_message(self, llm_id, message):
        self.logger.info("")
        self.logger.info("─" * 70)
        self.logger.info(f"💬 MESSAGE FROM {llm_id.upper()}")
        self.logger.info(f"   Length: {len(message)} characters")
        self.logger.info(f"   Preview: {message[:100]}{'...' if len(message) > 100 else ''}")
        self.logger.info("─" * 70)
        
        if not self.is_active:
            self.logger.warning("Message rejected: No active conversation")
            raise ValueError('No active conversation. Please start a conversation first.')
        
        if self.is_paused:
            self.logger.warning("Message rejected: Conversation is paused")
            raise ValueError('Conversation is paused. Please resume first.')
        
        if llm_id not in ['llm1', 'llm2']:
            self.logger.error(f"Message rejected: Invalid LLM ID '{llm_id}'")
            raise ValueError(f'Invalid LLM ID: {llm_id}')
        
        if not message or not message.strip():
            self.logger.warning("Message rejected: Empty message")
            raise ValueError('Message cannot be empty')
        
        if llm_id != self.current_turn:
            self.logger.warning(f"Message rejected: Not {llm_id}'s turn (current: {self.current_turn})")
            raise ValueError(f"It's not {llm_id}'s turn. Current turn: {self.current_turn}")
        
        # Emit thinking state
        self.socketio.emit('message:thinking', {'llmId': llm_id})
        self.logger.debug(f"Emitted thinking indicator for {llm_id}")
        
        try:
            # Get the appropriate service and config
            service = self.llm1_service if llm_id == 'llm1' else self.llm2_service
            config = self.llm1_config if llm_id == 'llm1' else self.llm2_config
            
            self.logger.debug(f"Using service for {llm_id} - Model: {config.get('model')}, Temperature: {config.get('temperature')}")
            
            # Build messages array for API
            api_messages = [
                {
                    'role': 'system',
                    'content': config.get('systemPrompt', 'You are a helpful AI assistant.')
                }
            ]
            
            # Add conversation history
            history_count = 0
            for msg in self.history:
                if msg.get('llmId') != 'system':
                    role = 'assistant' if msg.get('llmId') == llm_id else 'user'
                    api_messages.append({
                        'role': role,
                        'content': msg.get('content')
                    })
                    history_count += 1
            
            # Add current message
            api_messages.append({
                'role': 'user',
                'content': message
            })
            
            self.logger.info(f"📤 Sending to {llm_id.upper()} API:")
            self.logger.info(f"   Model: {config.get('model')}")
            self.logger.info(f"   Messages in context: {len(api_messages)} (including {history_count} from history)")
            self.logger.info(f"   Temperature: {config.get('temperature', 0.7)}")
            self.logger.info(f"   Max Tokens: {config.get('maxTokens', 1000)}")
            self.logger.info(f"   ⏳ Waiting for {llm_id.upper()} response...")
            
            # Generate response
            response = service.generate_response(api_messages, {
                'temperature': config.get('temperature', 0.7),
                'maxTokens': config.get('maxTokens', 1000),
                'model': config.get('model')
            })
            
            response_content = response.get('content', '')
            self.logger.info(f"✅ Response received from {llm_id.upper()}:")
            self.logger.info(f"   Length: {len(response_content)} characters")
            self.logger.info(f"   Preview: {response_content[:150]}{'...' if len(response_content) > 150 else ''}")
            if response.get('usage'):
                usage = response.get('usage', {})
                prompt_tokens = usage.get('prompt_tokens', 'N/A')
                completion_tokens = usage.get('completion_tokens', 'N/A')
                total_tokens = usage.get('total_tokens', 'N/A')
                self.logger.info(f"   📊 Token Usage: Prompt={prompt_tokens}, Completion={completion_tokens}, Total={total_tokens}")
            
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
            self.logger.info(f"🔄 Turn switched: {self.current_turn.upper()} is now active")
            
            # Emit message sent event
            self.socketio.emit('message:sent', {
                'userMessage': user_message,
                'assistantMessage': assistant_message,
                'currentTurn': self.current_turn,
                'history': self.history
            })
            self.logger.info(f"📡 Sent update to frontend (message:sent event)")
            
            # Automatically continue conversation if enabled
            if self.auto_continue and not self.is_paused:
                # Use the assistant's response as the message for the next LLM
                next_message = response['content']
                self.logger.info(f"⚡ Auto-continuation enabled: {self.current_turn.upper()} will respond automatically in 1 second...")
                # Schedule the next response (small delay to allow UI to update)
                import threading
                threading.Timer(1.0, self.continue_conversation, args=[next_message]).start()
            else:
                if self.is_paused:
                    self.logger.info(f"⏸️  Auto-continuation paused - waiting for user to resume")
                else:
                    self.logger.info(f"⏹️  Auto-continuation disabled - waiting for manual message")
                
        except Exception as e:
            self.logger.error(f"Error processing message from {llm_id}: {str(e)}", exc_info=True)
            self.socketio.emit('error', {
                'llmId': llm_id,
                'message': str(e)
            })
            raise
    
    def continue_conversation(self, message):
        """
        Automatically continue the conversation by sending a message from the current turn LLM.
        This is used for automatic turn-based conversation between LLMs.
        """
        if not self.is_active or self.is_paused:
            self.logger.debug("⏸️  Cannot continue: conversation inactive or paused")
            return
        
        if not self.current_turn:
            self.logger.warning("⚠️  Cannot continue: no current turn set")
            return
        
        try:
            self.logger.info(f"🔄 AUTO-CONTINUATION: {self.current_turn.upper()} will now respond")
            # Send the message from the current turn LLM
            self.send_message(self.current_turn, message)
        except Exception as e:
            self.logger.error("=" * 70)
            self.logger.error(f"❌ ERROR in auto-continuation: {str(e)}")
            self.logger.error("=" * 70)
            # Stop auto-continuation on error
            self.auto_continue = False
            self.socketio.emit('error', {
                'message': f'Auto-continuation stopped: {str(e)}'
            })
    
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
        self.logger.info("")
        self.logger.info("⏸️  CONVERSATION PAUSED")
        self.logger.info("   Auto-continuation stopped - LLMs will not respond automatically")
        self.logger.info("")
    
    def resume(self):
        self.is_paused = False
        self.logger.info("")
        self.logger.info("▶️  CONVERSATION RESUMED")
        self.logger.info("   Auto-continuation enabled - LLMs will continue automatically")
        self.logger.info("")
        # Optionally continue conversation if there's a current turn
        if self.auto_continue and self.current_turn and self.history:
            # Get the last assistant message to continue from
            last_message = None
            for msg in reversed(self.history):
                if msg.get('role') == 'assistant':
                    last_message = msg.get('content')
                    break
            if last_message:
                self.logger.info("Resuming auto-conversation after resume")
                import threading
                threading.Timer(0.5, self.continue_conversation, args=[last_message]).start()
    
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

